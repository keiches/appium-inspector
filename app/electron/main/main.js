import {app} from 'electron';
import debug from 'electron-debug';
import {resolve} from 'path';

import {installExtensions} from './debug';
import {isDev, isMac, setupIPCListeners} from './helpers';
import {setupMainWindow} from './windows';
import {log} from './logger';
import {getDevices} from './device-manager';
import {checkEnvironments, ROOT_PATH} from './utils.js';
import {startAppiumServer, startTestServer} from './services';
import testRunner from './services/test/runner';

// Used when opening Inspector through an .appiumsession file (Windows/Linux).
// This value is not set in dev mode, since accessing argv[1] there throws an error,
// and this flow only makes sense for the installed Inspector app anyway
export let openFilePath = isMac || isDev ? null : process.argv[1];

let appiumServer;
/** @type {import('http').Server<import('http').IncomingMessage, import('http').ServerResponse>} */
let testServer;
/** @type {import('child_process').ChildProcess} */
/** @type {import('teen_process').SubProcess} */

// Used when opening Inspector through an .appiumsession file (macOS)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  app.quit();
});

const onAppQuit = () => {
  if (appiumServer && !appiumServer.killed) {
    log.log('Terminate Appium server...');
    appiumServer.kill?.('SIGTERM'); // NodeJS.Signals
    // process.kill(appiumServer.pid, 'SIGINT');
    appiumServer = null;
  }
  if (testServer && !testServer.listening) {
    log.log('Terminate Test server...');
    testServer.closeAllConnections();
    testServer = null;
  }
};

app.on('before-quit', onAppQuit).on('will-quit', onAppQuit);

// NOTE: launchinfo for Windows, Linux
// app.on('will-finish-launch', () => {});
// NOTE: launchinfo for macOS
app.on('ready', async () => {
  if (isDev) {
    await checkEnvironments();
    debug();
    await installExtensions();
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

  setupIPCListeners();
  const mainWindow = setupMainWindow();

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  appiumServer = await startAppiumServer(mainWindow);

  setTimeout(async () => {
    // 이 경우는 대기를 하지 않아도 되므로, synchronization 하지 않음
    testServer = await startTestServer(mainWindow);
  }, 1);
});
