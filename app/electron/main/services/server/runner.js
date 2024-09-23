import {dialog} from 'electron';
// import {EventEmitter} from 'events';
// import {openSync} from 'fs';
import getPort from 'get-port';
import {homedir} from 'os';
import {join, resolve} from 'path';

import {isDev} from '../../helpers';
import {log} from '../../logger';
import {exists, PACKAGES_PATH, ROOT_PATH, spawn} from '../../utils';
import {resolveNodePath} from '../index';

// const eventEmitter = new EventEmitter();

/**
 * Execute Appium server in background
 * @param {Electron.BrowserWindow} window
 * @returns {Promise<import('child_process').ChildProcess|import('teen_process').SubProcess|undefined>}
 */
async function runner(window) {
  log.log('[appium-server] starting server...');
  /*const controller = new AbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  const nodePath = await resolveNodePath();
  const controller = new AbortController();
  const { signal } = controller;
  // const fileIndex = (new Date()).toFormattedString();
  const appiumHome = process.env.APPIUM_HOME || resolve(homedir(), '.aav');
  log.debug(`[appium-server] APPIUM_HOME="${appiumHome}"`);
  log.debug(`[appium-server] ANDROID_HOME="${process.env.ANDROID_HOME}"`);
  /** @type {import('teen_process').SubProcessOptions} */
  const spawnOptions = {
    // detached: true, ==> server.unref();
    signal,
    // stdio: ['ignore', 'pipe', 'pipe'],
    // stdio: 'pipe',
    // stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    encoding: 'utf8',
    // cwd: 'C:\\Test\\Path',
    cwd: ROOT_PATH,
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않게 됨
    env: {
      ...process.env,
      APPIUM_HOME: appiumHome,
      ANDROID_HOME: process.env.ANDROID_HOME,
    },
  };

  // TODO: set actual appium server path
  const execPath = join(PACKAGES_PATH, 'server', 'packages', 'appium', 'index.js'); // 'build', 'lib', 'main.js');
  // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_server_${fileIndex}.txt`, 'w'), openSync(`stderr_server_${fileIndex}.txt`, 'w')]);
  if (!(await exists(execPath))) {
    log.error(`[appium-server] server ("${execPath}") not exists`);
    window.webContents.send('appium-server', 'error', 'server', 'server not found');
    return;
  } else {
    log.info(`[appium-server] server ("${execPath}") found`);
  }
  const child = spawn(nodePath, [
    isDev ? `--inspect=${await getPort({port: 9090})}` : '',
    execPath,
    'server',
    '--log-no-colors',
    // '--log-timestamp',
    // '--log-level', // defaults to logging everything. 'info', 'info:debug', 'info:info', 'info:warn', 'info:error', 'warn', 'warn:debug', 'warn:info', 'warn:warn', 'warn:error', 'error', 'error:debug', 'error:info', 'error:warn', 'error:error', 'debug', 'debug:debug', 'debug:info', 'debug:warn', 'debug:error'
    '--allow-cors',
    // '--show-config'
    '--config',
    // TODO:
    join(ROOT_PATH, 'configs', 'server.conf.json'),
    // '--use-plugins',
    // 'device-manager,element-wait,gestures,images,session,session-override,webhook',
  ], spawnOptions);

  if (process.env.NODE_NATIVE) {
    child.stdout?.setEncoding?.('utf-8');
    child.stdout?.on?.('data', (/** @type {Buffer} */ data) => {
      // if we get here, all we know is that the proc exited
      log.log('[appium-server] data:', data.toString());
      // exited with code 127 from signal SIGHUP
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: data.toString(),
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'stdout::data', data.toString());
    });

    child.stderr?.setEncoding?.('utf-8');
    child.stderr?.on?.('data', (/** @type {Buffer} */ data) => {
      log.error('[appium-server] stderr:', data.toString('utf-8'));
      window.webContents.send('appium-server', 'data', 'server', 'stderr::data', data.toString());
    });

    child.on('message', (message) => {
      log.log('[appium-server] message:', message);
      window.webContents.send('appium-server', 'data', 'server', 'message', message);
    });

    child.on('error', (err) => {
      // This will be called with err being an AbortError if the controller aborts
      log.error('[appium-server] error:', err.toString());
      window.webContents.send('appium-server', 'error', 'server', err.message);
      dialog.showMessageBox({
        type: 'error',
        buttons: ['OK'],
        message: err.message,
      });
    });

    child.on('disconnect', () => {
      log.log('[appium-server] disconnect');
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'disconnect',
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'disconnect');
    });

    child.on('close', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // but with a 0 exit code
      // app.quit();
      log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'close',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'close', {code, signal});
    });

    child.on('exit', (code, signal) => {
      log.log(`[appium-server] exit on code: ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'exit',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'exit', {code, signal});
      if (code === 0 && signal === null) {
        log.error('[appium-server] failed to run server');
      }
    });
  } else {
    child.on('exit', (code, signal) => {
      // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
      log.log(`[appium-server] exited with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'exit',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'exit', {code, signal});
    });

    child.on('stop', (code, signal) => {
      // if we get here, we know that we intentionally stopped the proc
      // by calling proc.stop
      log.log(`[appium-server] stop with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'stop',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'stop', {code, signal});
    });

    child.on('end', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // but with a 0 exit code
      log.log(`[appium-server] ended with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'end',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'end', {code, signal});
    });

    child.on('die', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // with a non-zero exit code
      log.log(`[appium-server] died with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'die',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'die', {code, signal});
    });

    child.on('output', (stdout, stderr) => {
      if (stdout?.includes('getTimeouts') || stderr?.includes('getTimeouts')) {
        log.log(`[appium-server] output::stdout1: ${stdout}`);
        log.log(`[appium-server] output::stderr1: ${stderr}`);
        return;
      }
      stdout && log.log(`[appium-server] output::stdout: ${stdout}`);
      stderr && log.log(`[appium-server] output::stderr: ${stderr}`);
      /*eventEmitter.emit('appium-server', {
        type: 'data',
        name: 'server',
        message: 'output',
        data: {
          message: stdout ?? stderr,
        },
      });*/
      window.webContents.send('appium-server', 'data', 'server', 'output', stdout ?? stderr);
    });

    /*child.on('lines-stdout', (lines) => {
      log.log('[appium-server] lines-stdout:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    child.on('lines-stderr', (lines) => {
      lines.length && log.log('[appium-server] lines-stderr:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
    // prepended
    child.on('stream-line', (line) => {
      if (line.includes('getTimeouts')) {
        log.log('[appium-server] [TIMEOUTS]');
      } else {
        log.log('[appium-server] stream-line:', line);
      }
      // [STDOUT] foo
    });*/

    await child.start((stdout, stderr) => {
      if (/fail/.test(stderr)) {
        // throw new Error('Encountered failure condition');
        log.error('[appium-server] encountered failure condition:', stderr);
        // window.webContents.send('appium-server', 'error', stderr);
        /*eventEmitter.emit('appium-server', {
          name: 'error',
          type: 'process',
          message: stderr,
        });*/
        window.webContents.send('appium-server', 'error', 'server', 'start', stderr);
      } else {
        /*eventEmitter.emit('appium-server', {
          type: 'data',
          name: 'server',
          message: 'appium server started',
        });*/
        // window.webContents.send('appium-server', 'message', stdout);
        window.webContents.send('appium-server', 'data', 'server', 'message', stdout);
      }
      // throw new Error(`Encountered failure condition: ${stderr}`);
      return stdout || stderr;
    });
  }

  log.log(`[appium-server] server spawned: ${child.pid}`);

  return child;
}

export default runner;
