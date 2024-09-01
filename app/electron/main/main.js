import {app} from 'electron';
import debug from 'electron-debug';

// import {installExtensions} from './debug';
import {getAppiumSessionFilePath, isDev} from './helpers';
import {setupMainWindow} from './windows';
import {log} from './logger';
import {getDevices} from './device-manager';
import {checkEnvironments} from './utils.js';
import {startAppiumServer, startTestServer} from './services';

// const log = console || _logger;

export let openFilePath = getAppiumSessionFilePath(process.argv, app.isPackaged);

let appiumServer;
let testerServer;

app.on('open-file', (event, filePath) => {
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  app.quit();
});

const onAppQuit = () => {
  if (appiumServer && !appiumServer.killed) {
    log.log('Terminate Appium server...');
    appiumServer.kill?.('SIGTERM'); // NodeJS.Signals
    // process.kill(server.pid, 'SIGINT');
    appiumServer = null;
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
    // TODO: uncomment this after upgrading to Electron 15+
    // await installExtensions();
  }

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  appiumServer = await startAppiumServer();

  getDevices()
    // eslint-disable-next-line promise/prefer-await-to-then
    .then(() => {
      //
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch((_) => {
      //
    });

  const mainWindow = setupMainWindow();

  setTimeout(() => {
    // 이 경우는 대기를 하지 않아도 되므로, synchronization 하지 않음
    testerServer = startTestServer(mainWindow);
  });
});
