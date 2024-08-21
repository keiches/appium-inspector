import {app, dialog} from 'electron';
import debug from 'electron-debug';
import {existsSync} from 'fs';
// import {randomUUID} from 'crypto';
import {v4} from 'uuid';

const randomUUID = () => {
  const tokens = v4().split('-');
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};

// import {installExtensions} from './debug';
import {getAppiumSessionFilePath, isDev} from './helpers';
import {setupMainWindow} from './windows';
import NodeDetector from './node-detector';
// import server from '../server/build/lib/main.js';
// import which from 'which';
// import fs from 'node:fs';
// import {fs} from '@appium/support';
// import {exec, spawn} from 'node:child_process';
import {spawn} from 'child_process';
import {join, resolve} from 'path';
import {homedir, platform} from 'os';
// import _logger from 'console';
import {exec} from 'teen_process';
import {log} from './logger';
import {getDevices} from './device-manager';
// import {spawn} from './utils';

// const log = console || _logger;

export let openFilePath = getAppiumSessionFilePath(process.argv, app.isPackaged);

let server;
let actionsTester;

app.on('open-file', (event, filePath) => {
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  if (actionsTester && !actionsTester.killed) {
    log.log('Terminate actions runner...');
    actionsTester.kill('SIGTERM');
    actionsTester = null;
  }
  if (server && !server.killed) {
    log.log('Terminate Appium server...');
    server.kill('SIGTERM'); // NodeJS.Signals
    // process.kill(server.pid, 'SIGINT');
    server = null;
  }
  app.quit();
});

/*
async function spawn(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}
*/

const checkEnvironments = (process.env.NODE_ENV === 'development') ? () => {
  log.log(`----App Path> ${app.getAppPath()}`);
  // NOTE: in renderer/preload, use "remote.app.getAppPath()"
  log.log(`----Current Directory> ${__dirname}`);
  log.log(`----HOME> ${homedir()}`);
  log.log(`----WORKING_HOME> ${resolve(homedir(), '.aav')}`);
  log.log(`----WORKING_HOME exists> ${existsSync(resolve(homedir(), '.aav'))}`);
  log.log(`----APPIUM_HOME> ${process.env.APPIUM_HOME}`);
  log.log(`----APPIUM_HOME> ${existsSync(process.env.APPIUM_HOME)}`);
  log.log(`----JAVA_HOME> ${process.env.JAVA_HOME}`);
  log.log(`----JAVA_HOME> ${existsSync(process.env.JAVA_HOME)}`);
  log.log(`----JDK_HOME> ${process.env.JDK_HOME}`);
  log.log(`----JDK_HOME> ${existsSync(process.env.JDK_HOME)}`);
  log.log(`----ANDROID_HOME> ${process.env.ANDROID_HOME}`);
  log.log(`----ANDROID_HOME> ${existsSync(process.env.ANDROID_HOME)}`);
} : () => {};

/**
 * Get Node.Js executable path
 * @returns {Promise<string>}
 */
async function resolveNodePath() {
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (!nodePath) {
    log.error('node cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'node cannot be found',
    });
  }

  log.log(`Node is installed at: ${nodePath}. ${
    (await exec('node', ['--version'])).stdout.split('\n')[0]
  }`);

  return nodePath;
}

/**
 * Execute Appium server in background
 * @returns {Promise<void>}
 */
async function runAppiumServer() {
  log.log('Starting Appium server...');
  /*const controller = new AbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (!nodePath) {
    log.error('node cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'node cannot be found',
    });
    return;
  }

  log.log(`Node is installed at: ${nodePath}. ${
    (await exec('node', ['--version'])).stdout.split('\n')[0]
  }`);

  const rootPath = process.env.NODE_ENV === 'development' ? app.getAppPath() : __dirname;
  // server = spawn(nodePath, [join(__dirname, '../server/build/lib/main.js')]/*, {
  // server = spawn(nodePath, ['../node_modules/appium/build/lib/main.js']/*, {
  server = spawn(nodePath, [
    // TODO: search appium server
    // join(__dirname, '../node_modules/ap\pium/build/lib/main.js'),
    // 'C:\\opt\\nodejs\\node_modules\\appium\\index.js',
    join(rootPath, 'packages', 'server', 'packages', 'appium', 'build', 'lib', 'main.js'),
    // resolve(join('..', 'server', 'packages', 'appium')),
    // ../server/packages/appium
    'server',
    // '--show-config'
    '--config',
    join(rootPath, 'configs', 'server.conf.js'),
  ], {
    // stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    // cwd: 'C:\\Test\\Path',
    // detached: true, ==> server.unref();
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않는 듯함
    env: {
      // 'APPIUM_HOME': join(__dirname, '.appium'),
      'APPIUM_HOME': resolve(homedir(), '.aav'),
      'ANDROID_HOME': 'C:\\opt\\Android\\Sdk',
    },
  });

  server.stdout.on('data', (data) => {
    // if we get here, all we know is that the proc exited
    log.log(`[appium-server] stdout: ${data}`);
    // exited with code 127 from signal SIGHUP
  });

  server.stderr.on('data', (data) => {
    log.error(`[appium-server] stderr: ${data}`);
  });

  server.on('message', (message) => {
    log.log('[appium-server] message:' + message);
  });

  server.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[appium-server] error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  server.on('disconnect', () => {
    log.warn('[appium-server] disconnect');
  });

  server.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
  });

  server.on('exit', (code) => {
    log.log('[appium-server] exit on code: ' + code);
  });

  log.log(`[appium-server] spawned: ${server.pid}`);
}

/**
 * Execute actions handler in background
 * @param {string} testId
 * @returns {Promise<void>}
 */
async function runActionsTester(testId) {
  log.log(`Compiling test runner "${testId}"...`);
  const rootPath = process.env.NODE_ENV === 'development' ? app.getAppPath() : __dirname;
  // #1 compile java to class
  actionsTester = spawn('bash', [
    // process.env.NODE_ENV === 'development' ? join(app.getAppPath(), 'libs', 'actions-tester', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`) : join(__dirname, '..', 'libs', 'actions-tester', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`),
    join(rootPath, 'packages', 'actions-tester', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`),
    testId,
  ], {
    // detached: true, ==> actionsTester.unref();
    detached: true,
    stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    // cwd: 'C:\\Test\\Path',
  });

  actionsTester.stdout.on('data', (data) => {
    // if we get here, all we know is that the proc exited
    log.log(`[actions-tester] compiler stdout: ${data}`);
    // exited with code 127 from signal SIGHUP
  });

  actionsTester.stderr.on('data', (data) => {
    log.error(`[actions-tester] compiler stderr: ${data}`);
  });

  actionsTester.on('message', (message) => {
    log.log('[actions-tester] compiler message:' + message);
  });

  actionsTester.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[actions-tester] compiler error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  actionsTester.on('disconnect', () => {
    log.warn('[actions-tester] compiler disconnect');
  });

  actionsTester.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[actions-tester] compiler closed with code ${code} from signal ${signal}`);
  });

  actionsTester.on('exit', (code, signal) => {
    log.log(`[actions-tester] compiler existed with code ${code} from signal ${signal}`);
    if (signal === null) {
      log.log('Test runner compiled');
      // TODO: when compiling is done successfully, start running
      setTimeout(() => {
        actionsTester.unref();
        log.log('Starting test runner...');
        // #2 run class
        actionsTester = spawn(join(__dirname, '..', 'libs', 'actions-tester', 'run'), [
          testId,
        ], {
          // detached: true, ==> actionsTester.unref();
          detached: true,
          stdio: ['pipe', 'inherit', 'inherit']
          // shell: true,
          // cwd: 'C:\\Test\\Path',
        });

        actionsTester.stdout.on('data', (data) => {
          // if we get here, all we know is that the proc exited
          log.log(`[actions-tester] runner stdout: ${data}`);
          // exited with code 127 from signal SIGHUP
        });

        actionsTester.stderr.on('data', (data) => {
          log.error(`[actions-tester] runner stderr: ${data}`);
        });

        actionsTester.on('message', (message) => {
          log.log('[actions-tester] message:' + message);
        });

        actionsTester.on('error', (err) => {
          // This will be called with err being an AbortError if the controller aborts
          log.error('[actions-tester] runner error:' + err.toString());
          dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: err.message,
          });
        });

        actionsTester.on('disconnect', () => {
          log.warn('[actions-tester] runner disconnect');
        });

        actionsTester.on('close', (code, signal) => {
          // if we get here, we know that the process stopped outside our control
          // but with a 0 exit code
          // app.quit();
          log.log(`[actions-tester] runner closed with code ${code} from signal ${signal}`);
        });

        actionsTester.on('exit', (code, signal) => {
          log.log(`[actions-tester] runner existed with code ${code} from signal ${signal}`);
          if (signal === null) {
            // TODO: when compiling is done successfully, start running
            log.log('Test runner stopped');
          } else {
            // TODO: send reasons about failed to run
            log.error(`Failed to run test runner with error ${signal}`);
          }
        });

        log.log(`[actions-tester] runner spawned: ${actionsTester.pid}`);
      }, 1);
    } else {
      // TODO: send reasons about failed to compile
      log.error(`Failed to compile test runner with error ${signal}`);
    }
  });

  log.log(`[actions-tester] compiler spawned: ${actionsTester.pid}`);
}

// launchinfo for Windows, Linux
// app.on('will-finish-launch', () => {});
// launchinfo for macOS
app.on('ready', async () => {
  if (isDev) {
    checkEnvironments();
    debug();
    // TODO: uncomment this after upgrading to Electron 15+
    // await installExtensions();
  }

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  // await runAppiumServer();

  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  await runActionsTester(randomUUID());

  await getDevices();

  setupMainWindow();
});
