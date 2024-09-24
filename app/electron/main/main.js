import {app, globalShortcut} from 'electron';
import debug from 'electron-debug';

import {installExtensions} from './debug';
// DEBUG:
// import {getDevices} from './device-manager';
import {isDev, isMac, setupIPCListeners} from './helpers';
import {log} from './logger';
import {startAppiumServer, startTestServer} from './services';
import {checkEnvironments} from './utils.js';
import {setupMainWindow} from './windows';

// Used when opening Inspector through an .appiumsession file (Windows/Linux).
// This value is not set in dev mode, since accessing argv[1] there throws an error,
// and this flow only makes sense for the installed Inspector app anyway
export let openFilePath = isMac || isDev ? null : process.argv[1];

/** @type {import('child_process').ChildProcess|import('teen_process').SubProcess} */
/** @type {import('./utils.js').SpawnProcess|undefined|null} */
let appiumServer;
/** @type {import('./services.js').Server|undefined|null} */
let testServer;

// Used when opening Inspector through an .appiumsession file (macOS)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  app.quit();
});

// NOTE: launchinfo for Windows, Linux
// app.on('will-finish-launch', () => {});
// NOTE: launchinfo for macOS
app.on('ready', async () => {
  if (isDev) {
    debug();
    await installExtensions();
  }

  setupIPCListeners();
  const mainWindow = setupMainWindow();

  if (isDev) {
    await checkEnvironments();
  }

  // DEBUG:
  /*getDevices()
    // eslint-disable-next-line promise/prefer-await-to-then
    .then(() => {
      //
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch((_) => {
      //
    });*/

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  appiumServer = await startAppiumServer(mainWindow);

  setTimeout(async () => {
    // 이 경우는 대기를 하지 않아도 되므로, synchronization 하지 않음
    testServer = await startTestServer(mainWindow);
  }, 1);
});

/*
// @site: https://www.electronjs.org/docs/latest/api/global-shortcut
app.whenReady().then(() => {
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed');
  });

  if (!ret) {
    console.log('registration failed');
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'));
});
*/

app.on('before-quit', async () => {
  if (appiumServer) {
    log.log('[client] terminating appium server...');
    try {
      const code = await appiumServer.terminate?.('SIGTERM'); // NodeJS.Signals
      log.log('[client] "appium-server" killed process with code:', code);
      /*if (process.env.NODE_NATIVE) {
        if (/!*appiumServer instanceof ChildProcess && *!/ !appiumServer.killed) {
          // process.kill(appiumServer.pid, 'SIGINT');
          const result = appiumServer.kill?.('SIGTERM'); // NodeJS.Signals
          log.log(`[client] "appium-server" ${result ? 'process killed' : 'failed to kill process'}`);
        }
      } else {
        if (/!*appiumServer instanceof SubProcess && *!/ appiumServer.isRunning) {
          // process.kill(appiumServer.proc.pid, 'SIGINT');
          const code = await appiumServer.stop?.('SIGTERM'); // NodeJS.Signals
          log.log('[client] "appium-server" killed process with code:', code);
        }
      }*/
    } catch (err) {
      log.error('[client] "appium-server" failed to kill process:', err);
    }
    appiumServer = null;
  }
  if (testServer && !testServer.listening) {
    log.log('[client] closing test server...');
    try {
      testServer.destroy(); // .closeAllConnections();
    } catch (err) {
      log.error('[client] "test-server" failed to destroy server:', err);
    }
    testServer = null;
  }
});

app.on('will-quit', () => {
  // Unregister a shortcut.
  // globalShortcut.unregister('CommandOrControl+X');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});
