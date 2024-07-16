import {app, dialog} from 'electron';
import debug from 'electron-debug';

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
import {homedir} from 'os';
// import _logger from 'console';
import {exec} from 'teen_process';
import log from './logger';
// import {spawn} from './utils';

// const log = console || _logger;

export let openFilePath = getAppiumSessionFilePath(process.argv, app.isPackaged);

let server;

app.on('open-file', (event, filePath) => {
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  if (server && !server.killed) {
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

async function runServer0() {
  /*const controller = new AbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (nodePath) {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec('node', ['--version'])).stdout.split('\n')[0]
    }`);

    // server = spawn(nodePath, ['../server/build/lib/main.js']/*, {
    server = spawn(nodePath, ['../node_modules/appium/build/lib/main.js']/*, {
      stdio: ['pipe', 'inherit', 'inherit'],
    }*/);

    server.on('exit', (code, signal) => {
      // if we get here, all we know is that the proc exited
      log.log(`exited with code ${code} from signal ${signal}`);
      // exited with code 127 from signal SIGHUP
    });

    server.on('stop', (code, signal) => {
      // if we get here, we know that we intentionally stopped the proc
      // by calling proc.stop
    });

    server.on('end', (code, signal) => {
      // if we get here, we know that the process stopped outside of our control
      // but with a 0 exit code
    });

    server.on('die', (code, signal) => {
      // if we get here, we know that the process stopped outside of our control
      // with a non-zero exit code
    });

    server.on('output', (stdout, stderr) => {
      log.log(`stdout: ${stdout}`);
      log.log(`stderr: ${stderr}`);
    });

    // lines-stderr is just the same
    server.on('lines-stdout', (lines) => {
      log.log(lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
    // prepended
    server.on('stream-line', (line) => {
      log.log(line);
      // [STDOUT] foo
    });

    await server.start();
    log.log(`server spawned: ${server.isRunning}`);

    /*
    let input = '';
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });

    process.stdin.on('end', (chunk) => {
      eval(input);
    });

    process.stdin.on('error', (err) => {
      log.error(`process::stdin:\n${err}`);
    });
    */

    /*server.stdout.on('data', (data) => {
      log.log(`appium-server stdout:\n${data}`);
    });

    server.stderr.on('data', (data) => {
      log.error(`appium-server stderr:\n${data}`);
    });

    server.on('message', (message) => {
      log.log('[appium-server] ' + message);
    });

    server.on('error', (err) => {
      // This will be called with err being an AbortError if the controller aborts
      log.error('[appium-server] ' + err.toString());
      /!*dialog.showMessageBox({
        type: 'error',
        buttons: [t('OK')],
        message: err.message,
      });*!/
    });

    server.on('close', (code) => {
      // app.quit();
      log.log('[appium-server] close on code: ' + code);
    });

    server.on('exit', (code) => {
      log.log('[appium-server] exit on code: ' + code);
    });
    */

    app.on('window-all-closed', async () => {
      // controller.abort();
      await server.stop();
    });
  } else {
    log.error('node cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: [t('OK')],
      message: 'node cannot be found',
    });
  }
}

async function runServer() {
  /*const controller = new AbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (nodePath) {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec('node', ['--version'])).stdout.split('\n')[0]
    }`);

    log.log(`----1> ${__dirname}`);
    log.log(`----2> ${homedir()}`);
    log.log(`----3> ${resolve(homedir(), '.aav')}`);

    // server = spawn(nodePath, [join(__dirname, '../server/build/lib/main.js')]/*, {
    // server = spawn(nodePath, ['../node_modules/appium/build/lib/main.js']/*, {
    server = spawn(nodePath, [
      // TODO: search appium server
      // join(__dirname, '../node_modules/ap\pium/build/lib/main.js'),
      // 'C:\\opt\\nodejs\\node_modules\\appium\\index.js',
      'C:\\Users\\keiches\\Projects\\open\\appium\\appium\\packages\\appium\\build\\lib\\main.js',
      'server',
      '--config',
      join(__dirname, '../configs/server.conf.js'),
      // '--show-config'
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
          buttons: [t('OK')],
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
      // console.log(`child process terminated due to receipt of signal ${signal}`);
    });

    server.on('exit', (code) => {
      log.log('[appium-server] exit on code: ' + code);
    });

    log.log(`[appium-server] spawned: ${server.pid}`);

    app.on('window-all-closed', () => {
      // controller.abort();
      if (server && !server.killed) {
        server.kill('SIGTERM'); // NodeJS.Signals
        server = null;
      }
    });
  } else {
    log.error('node cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: [t('OK')],
      message: 'node cannot be found',
    });
  }
}

app.on('ready', async () => {
  if (isDev) {
    debug();
    // TODO: uncomment this after upgrading to Electron 15+
    // await installExtensions();
  }

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  // await runServer();

  setupMainWindow();
});
