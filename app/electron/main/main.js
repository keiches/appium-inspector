import {app, dialog} from 'electron';

// import {installExtensions} from './debug';
import {getAppiumSessionFilePath} from './helpers';
import {setupMainWindow} from './windows';
import NodeDetector from './node-detector';
// import server from '../server/build/lib/main.js';
// import which from 'which';
// import fs from 'node:fs';
// import {fs} from '@appium/support';
// import {exec, spawn} from 'node:child_process';
import {spawn} from 'node:child_process';
import {join, resolve} from 'node:path';
import {homedir} from 'node:os';
// import _logger from 'console';
import {exec} from 'teen_process';
import log from './logger';
// import {spawn} from './utils';

// const log = console || _logger;

const isDev = process.env.NODE_ENV === 'development';

export let openFilePath = getAppiumSessionFilePath(process.argv, app.isPackaged);

app.on('open-file', (event, filePath) => {
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
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
  const server = fork('../server/build/lib/main.js', [], {*/
  /*const server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (nodePath) {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec('node', ['--version'])).stdout.split('\n')[0]
    }`);

    const server = spawn(nodePath, ['../server/build/lib/main.js']/*, {
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
  const server = fork('../server/build/lib/main.js', [], {*/
  /*const server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (nodePath) {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec('node', ['--version'])).stdout.split('\n')[0]
    }`);

    log.log(`----> ${__dirname}`);

    // const server = spawn(nodePath, [join(__dirname, '../server/build/lib/main.js')]/*, {
    const server = spawn(nodePath, [
      join(__dirname, 'server/build/lib/main.js'),
      '--',
      '--config-file'
    ], {
      // stdio: ['pipe', 'inherit', 'inherit']
      env: {
        // 'APPIIM_HOME': join(__dirname, '.appium'),
        'APPIIM_HOME': resolve(homedir(), '.aav'),
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
      log.log('[appium-server] ' + message);
    });

    server.on('error', (err) => {
      // This will be called with err being an AbortError if the controller aborts
      log.error('[appium-server] ' + err.toString());
      dialog.showMessageBox({
        type: 'error',
          buttons: [t('OK')],
          message: err.message,
      });
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
      server.kill('SIGHUP');
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
    require('electron-debug')();
    // TODO: uncomment this after upgrading to Electron 15+
    // await installExtensions();
  }

  await runServer();

  setupMainWindow();
});
