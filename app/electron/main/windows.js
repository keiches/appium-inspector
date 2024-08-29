import {BrowserWindow, Menu, dialog, ipcMain, webContents} from 'electron';
import settings from 'electron-settings';
import {join} from 'path';
import {createServer} from 'http';
// import express from 'express';
import {randomBytes} from 'crypto';

import {PREFERRED_LANGUAGE} from '../../common/shared/setting-defs';
import i18n from './i18next';
import {openFilePath} from './main';
import {APPIUM_SESSION_EXTENSION, isDev} from './helpers';
import {rebuildMenus} from './menus';
import {log} from './logger';

import generator from './test/generator';
import {ROOT_PATH} from './utils';

const mainPath = isDev
  ? process.env.ELECTRON_RENDERER_URL
  : join(__dirname, '..', 'renderer', 'index.html'); // from 'main' in package.json
const splashPath = isDev
  ? `${process.env.ELECTRON_RENDERER_URL}/splash.html`
  : join(__dirname, '..', 'renderer', 'splash.html'); // from 'main' in package.json
const pathLoadMethod = isDev ? 'loadURL' : 'loadFile';

let mainWindow = null;

function buildSplashWindow() {
  return new BrowserWindow({
    width: 300,
    height: 300,
    minWidth: 300,
    minHeight: 300,
    frame: false,
  });
}

function buildSessionWindow() {
  const window = new BrowserWindow({
    show: false,
    width: 1100,
    height: 710,
    minWidth: 890,
    minHeight: 710,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'preload.js'), // from 'main' in package.json
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      additionalArguments: openFilePath ? [`filename=${openFilePath}`] : [],
    },
  });

  ipcMain.on('save-file-as', async () => {
    const {canceled, filePath} = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Appium File',
      filters: [{name: 'Appium Session Files', extensions: [APPIUM_SESSION_EXTENSION]}],
    });
    if (!canceled) {
      mainWindow.webContents.send('save-file', filePath);
    }
  });

  ipcMain.on('create-test-template', async (event, codes, ...args) => {
    log.debug('[create-test-template]', '__', codes, '__', ...args);
    await generator({
      codes,
      ...args,
      capabilities: {
        deviceName: 'emulator-5554',
        app: join(ROOT_PATH, 'apps', 'Android-MyDemoAppRN.1.3.0.build-244.apk'),
        appPackage: 'com.saucelabs.mydemoapp.rn',
        appActivity: '.MainActivity',
      },
      remoteAddress: 'http://localhost:4723', // 'host:port'
    });
  });

  return window;
}

export function setupMainWindow() {
  const splashWindow = buildSplashWindow();
  splashWindow[pathLoadMethod](splashPath);
  splashWindow.show();

  mainWindow = buildSessionWindow();
  mainWindow[pathLoadMethod](mainPath);

  mainWindow.webContents.on('did-finish-load', () => {
    rebuildMenus(mainWindow);
    splashWindow.destroy();
    mainWindow.show();
    mainWindow.focus();

    const server = createServer(function (req, res) {
      const port = randomBytes(16).toString('hex');
      ipcMain.once(port, function (ev, status, head, body) {
        res.writeHead(status, head);
        res.end(body);
      });
      window.webContents.send('request', req, port);
    });
    const server1 = createServer(function (req, res) {
      log.log(req.url);
      if (req.url === '/123') {
        // res.writeHead(200, {'content-type':'text/html; charset=utf-8`};
        res.write('ah, you send 123.');
        res.end();
      } else {
        const remoteAddress = res.socket.remoteAddress;
        const remotePort = res.socket.remotePort;
        // res.writeHead(200, {'content-type':'text/html; charset=utf-8`};
        res.end(`Your IP address is ${remoteAddress} and your source port is ${remotePort}.`);
      }
    });

    /*const server2 = express();
    server2.get('/', (req, res) => {
      return res.send('메인 페이지');
    });

    server2.get('/', (req, res) => {
      return res.send('로그인 페이지');
    });

    server2.listen(8080, () => {
      log.log('express server running on port 8080');
    });*/

    server.listen(8000, () => {
      log.log('http server running on port #8000');
    });

    server1.listen(8001, () => {
      log.log('http server running on port #8001');
    });

    log.log('http://localhost:8000/');

    if (isDev) {
      mainWindow.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('context-menu', (e, props) => {
    const {x, y} = props;

    Menu.buildFromTemplate([
      {
        label: i18n.t('Inspect element'),
        click() {
          mainWindow.inspectElement(x, y);
        },
      },
    ]).popup(mainWindow);
  });

  i18n.on('languageChanged', async (languageCode) => {
    // this event gets called before the i18n initialization event,
    // so add a guard condition
    if (!i18n.isInitialized) {
      return;
    }
    rebuildMenus(mainWindow);
    await settings.set(PREFERRED_LANGUAGE, languageCode);
    webContents.getAllWebContents().forEach((wc) => {
      wc.send('appium-language-changed', {
        language: languageCode,
      });
    });
  });
}

export function launchNewSessionWindow() {
  const win = buildSessionWindow();
  win[pathLoadMethod](mainPath);
  win.show();
}
