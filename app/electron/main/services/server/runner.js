import {dialog} from 'electron';
import {openSync} from 'fs';
import {homedir} from 'os';
import {join, resolve} from 'path';

import {isDev} from '../../helpers';
import {log} from '../../logger';
import {exists, PACKAGES_PATH, ROOT_PATH, spawn} from '../../utils';
import { ProcessAbortController } from '../abort-controller';
import {resolveNodePath} from '../index';

/**
 * Execute Appium server in background
 * @returns {Promise<void>}
 */
/*
async function runAppiumServer() {
  log.log('Starting Appium server...');
  /!*const controller = new ProcessAbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*!/
  /!*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*!/
  const nodePath = await resolveNodePath();
  const controller = new ProcessAbortController();
  const { signal } = controller;
  const fileIndex = toFormattedString(new Date());
  /!** @type {import('teen_process').SubProcessOptions} *!/
  const options = {
    signal,
    // stdio: ['ignore', 'pipe', 'pipe'],
    stdio: ['ignore', openSync(`stdout_client_${fileIndex}.txt`, 'w'), openSync(`stderr_client_${fileIndex}.txt`, 'w')],
    // stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    // cwd: 'C:\\Test\\Path',
    // detached: true, ==> server.unref();
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않는 듯함
    env: {
      // ...process.env,
      // 'APPIUM_HOME': join(__dirname, '.appium'),
      APPIUM_HOME: resolve(homedir(), '.aav'),
      ANDROID_HOME: 'C:\\opt\\Android\\Sdk', // process.env.ANDROID_HOME,
    },
  };
  // server = spawn(nodePath, [join(__dirname, '../server/build/lib/main.js')]/!*, {
  // server = spawn(nodePath, ['../node_modules/appium/build/lib/main.js']/!*, {
  serverProcess = spawn(nodePath, [
    // isDev ? '-inspect' : '',
    // TODO: set actual appium server path
    join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js'),
    // resolve(join('..', 'server', 'packages', 'appium')),
    // ../server/packages/appium
    'server',
    // '--show-config'
    '--config',
    join(ROOT_PATH, 'configs', 'server.conf.js'),
  ], options);

  serverProcess.stdout?.setEncoding?.('utf-8');
  options.stdio[1] === 'pipe' && serverProcess.stdout.on('data', (/!** @type {Buffer} *!/ chunk) => {
    // if we get here, all we know is that the proc exited
    log.log(`[appium-server] stdout: ${chunk.toString('utf-8')}`);
    // exited with code 127 from signal SIGHUP
  });

  serverProcess.stderr?.setEncoding?.('utf-8');
  options.stdio[2] === 'pipe' && serverProcess.stderr.on('data', (/!** @type {Buffer} *!/ chunk) => {
    log.error(`[appium-server] stderr: ${chunk.toString('utf-8')}`);
  });

  serverProcess.on('message', (message) => {
    log.log('[appium-server] message:' + message);
  });

  serverProcess.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[appium-server] error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  serverProcess.on('disconnect', () => {
    log.warn('[appium-server] disconnect');
  });

  serverProcess.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
  });

  serverProcess.on('exit', (code) => {
    log.log('[appium-server] exit on code: ' + code);
  });

  log.log(`[appium-server] spawned: ${serverProcess.pid}`);
}
*/

/**
 * Execute Appium server in background
 * @returns {Promise<ChildProcess|import('teen_process').SubProcess>}
 */
async function runner() {
  log.log('Starting Appium server...');
  /*const controller = new ProcessAbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  const nodePath = await resolveNodePath();
  const controller = new ProcessAbortController();
  const { signal } = controller;
  // const fileIndex = (new Date()).toFormattedString();
  /** @type {import('teen_process').SubProcessOptions} */
  const spawnOptions = {
    signal,
    // stdio: ['ignore', 'pipe', 'pipe'],
    stdio: 'pipe',
    // stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    // cwd: 'C:\\Test\\Path',
    // detached: true, ==> server.unref();
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않는 듯함
    env: {
      // ...process.env,
      // 'APPIUM_HOME': join(__dirname, '.appium'),
      APPIUM_HOME: resolve(ROOT_PATH, '..', '.aav'),
      ANDROID_HOME: process.env.ANDROID_HOME,
    },
  };
  log.info(`[appium-server] APPIUM_HOME("${resolve(ROOT_PATH, '..', '.aav')}") found`);
  // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_server_${fileIndex}.txt`, 'w'), openSync(`stderr_server_${fileIndex}.txt`, 'w')]);
  if (!(await exists(join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js')))) {
    log.error(`[appium-server] "${join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js')}" not found`);
  } else {
    log.info(`[appium-server] "${join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js')}" found`);
  }
  // TODO: "teen_process::SubProcess"로 개선하자!
  const child = spawn(nodePath, [
    // isDev ? '-inspect' : '',
    // TODO: set actual appium server path
    join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js'),
    // resolve(join('..', 'server', 'packages', 'appium')),
    // ../server/packages/appium
    'server',
    // '--show-config'
    '--config',
    join(ROOT_PATH, 'configs', 'server.conf.js'),
    // '--use-plugins',
    // 'device-manager,element-wait,gestures,images,session,session-override,webhook',
    // 'device-manager,element-wait,gestures,images',
  ], spawnOptions);

  child.on('exit', (code, signal) => {
    // if we get here, all we know is that the proc exited
    log.log(`exited with code ${code} from signal ${signal}`);
    // exited with code 127 from signal SIGHUP
    log.log(`[appium-server] exited with code ${code} from signal ${signal}`);
  });

  child.on('stop', (code, signal) => {
    // if we get here, we know that we intentionally stopped the proc
    // by calling proc.stop
    log.log(`[appium-server] stop with code ${code} from signal ${signal}`);
  });

  child.on('end', (code, signal) => {
    // if we get here, we know that the process stopped outside of our control
    // but with a 0 exit code
    log.log(`[appium-server] ended with code ${code} from signal ${signal}`);
  });

  child.on('die', (code, signal) => {
    // if we get here, we know that the process stopped outside of our control
    // with a non-zero exit code
    log.log(`[appium-server] died with code ${code} from signal ${signal}`);
  });

  child.on('output', (stdout, stderr) => {
    stdout && log.log(`[appium-server] output::stdout: ${stdout}`);
    stderr && log.log(`[appium-server] output::stderr: ${stderr}`);
  });

  // lines-stderr is just the same
  child.on('lines-stdout', (lines) => {
    log.log('[appium-server] lines:', lines);
    // ['foo', 'bar', 'baz']
    // automatically handles rejoining lines across stream chunks
  });

  // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
  // prepended
  child.on('stream-line', (line) => {
    log.log('[appium-server] line:', line);
    // [STDOUT] foo
  });

  child.stdout?.setEncoding?.('utf-8');
  child.stdout?.on?.('data', (/** @type {Buffer} */ data) => {
    // if we get here, all we know is that the proc exited
    log.log('[appium-server] stdout:', data.toString());
    // exited with code 127 from signal SIGHUP
  });

  child.stderr?.setEncoding?.('utf-8');
  child.stderr?.on?.('data', (/** @type {Buffer} */ data) => {
    log.error('[appium-server] stderr:', data.toString('utf-8'));
  });

  child.on('message', (message) => {
    log.log('[appium-server] message:', message);
  });

  child.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[appium-server] error:', err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  child.on('disconnect', () => {
    log.warn('[appium-server] disconnected');
  });

  child.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
  });

  child.on('exit', (code, signal) => {
    log.log(`[appium-server] exit on code: ${code} from signal ${signal}`);
  });

  await child.start((stdout, stderr) => {
    if (/fail/.test(stderr)) {
      throw new Error('Encountered failure condition');
    }
    return stdout || stderr;
  });

  log.log(`[appium-server] spawned: ${child.pid}`);

  return child;
}

export default runner;
