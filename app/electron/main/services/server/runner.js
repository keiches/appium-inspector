import {dialog} from 'electron';
import {openSync} from 'fs';
import {homedir} from 'os';
import {join, resolve} from 'path';

import {isDev} from '../../helpers';
import {log} from '../../logger';
import {PACKAGES_PATH, ROOT_PATH, resolveNodePath, spawn} from '../../utils';

/**
 * Execute Appium server in background
 * @returns {Promise<ChildProcess|import('teen_process').SubProcess>}
 */
async function runner() {
  log.log('Starting Appium server...');
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
  const fileIndex = (new Date()).toFormattedString();
  /** @type {import('teen_process').SubProcessOptions} */
  const spawnOptions = {
    signal,
    stdio: ['ignore', 'pipe', 'pipe'],
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

  isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_server_${fileIndex}.txt`, 'w'), openSync(`stderr_server_${fileIndex}.txt`, 'w')]);
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
  ], spawnOptions);

  child.stdout?.setEncoding?.('utf-8');
  spawnOptions.stdio[1] === 'pipe' && child.stdout.on('data', (/** @type {Buffer} */ data) => {
    // if we get here, all we know is that the proc exited
    log.log(`[appium-server] stdout: ${data.toString()}`);
    // exited with code 127 from signal SIGHUP
  });

  child.stderr?.setEncoding?.('utf-8');
  spawnOptions.stdio[2] === 'pipe' && child.stderr.on('data', (/** @type {Buffer} */ data) => {
    log.error(`[appium-server] stderr: ${data.toString('utf-8')}`);
  });

  child.on('message', (message) => {
    log.log('[appium-server] message:' + message);
  });

  child.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[appium-server] error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  child.on('disconnect', () => {
    log.warn('[appium-server] disconnect');
  });

  child.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
  });

  child.on('exit', (code) => {
    log.log('[appium-server] exit on code: ' + code);
  });

  log.log(`[appium-server] spawned: ${child.pid}`);

  return child;
}

export default runner;
