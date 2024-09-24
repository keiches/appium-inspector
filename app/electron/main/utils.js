import './prototype-date';
import './prototype-string';

import {spawn as spawnNode} from 'child_process';
import {randomBytes, randomUUID} from 'crypto';
import {app} from 'electron';
import {constants, existsSync, promises, realpathSync} from 'fs';
import {homedir, platform, tmpdir} from 'os';
import {join} from 'path';
import {SubProcess} from 'teen_process';

// import {isFunction} from 'lodash';
import {log} from './logger';
import {resolveJavaExecutePaths, resolveNodePath} from './services';

// NOTE: in renderer/preload, use "remote.app.getAppPath()".
export const ROOT_PATH = process.env.NODE_ENV === 'development' ? app.getAppPath() : __dirname;
// appium-app-validator\client
// appium-app-validator\client\dist\main

export const PACKAGES_PATH = join(ROOT_PATH, 'packages');

export const JRM_PATH = join(PACKAGES_PATH, 'jrm');

// NOTE: normally use tmpdir is ok, but macOS/Linux does not return actual temp dir.
export const TEMP_PATH = realpathSync(tmpdir(), {encoding: 'utf8'});

export const TESTER_PATH = join(PACKAGES_PATH, 'action-tester');
export const TESTER_TEMPLATE_PATH = join(TESTER_PATH, 'template');
export const TESTER_LIBS_PATH = join(TESTER_PATH, 'libs');
export const TESTER_TEMP_PATH = join(TEMP_PATH, 'aav');

export const isWindows = platform() === 'win32';

export const uuid = (typeof randomUUID === 'function') ? randomUUID : () => randomBytes(16).toString('hex');
/*
export const uuid = () => {
  const tokens = v4().split('-');
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};
*/

/**
 * Get executable name by platform os
 * @param {string} name
 * @return {string}
 */
export const getExecutableName = (name) => {
  if (isWindows) {
    return `${name}.exe`;
  }
  return name;
};

export async function exists(path) {
  /*try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }*/
  // return await fs.hasAccess(path);
  try {
    await promises.access(path, constants.R_OK);
  } catch {
    return false;
  }
  return true;
}

/**
 * @typedef {Object} ChildProcessOptions
 * @property {string|URL}  [cwd]
 * @property {Record<string, string>} [env]
 * @property {string} [argv0]
 * @property {Array|string} [stdio]
 * @property {boolean} [detached]
 * @property {number} [uid]
 * @property {number} [gid]
 * @property {string} [serialization]
 * @property {boolean|string} [shell]
 * @property {boolean} [windowsVerbatimArguments]
 * @property {boolean} [windowsHide]
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 * @property {string|number} [killSignal]
 */

/**
 * @typedef {import('child_process').ChildProcessOptions&import('teen_process').SubProcessOptions} SpawnProcessOptions
 * // @extends import('teen_process').SubProcessOptions
 */

/**
 * @typedef {import('child_process').ChildProcess|import('teen_process').SubProcess} SpawnProcess
 * @property {(signal?: NodeJS.Signals | number) => Promise<number>} terminate
 */

/**
 * @param {import('child_process').ChildProcess|import('teen_process').SubProcess} spawnedProcess
 * @return {SpawnProcess}
 */
function mixinSpawnedProcess(spawnedProcess) {
  /** @type {(signal?: NodeJS.Signals | number) => Promise<number>} */
  spawnedProcess.terminate = (async function terminate(signal) {
    if (process.env.NODE_NATIVE) {
      if (/*this instanceof ChildProcess && */ !this.killed) {
        // process.kill(this.pid, 'SIGINT');
        return this.kill?.(signal ?? 'SIGTERM') ? 0 : 1; // NodeJS.Signals
      }
    } else {
      if (/*this instanceof SubProcess && */ this.isRunning) {
        // process.kill(this.proc.pid, 'SIGINT');
        return await this.stop?.(signal ?? 'SIGTERM'); // NodeJS.Signals
      }
    }
  }).bind(spawnedProcess);

  return /** @type {SpawnProcess} */ spawnedProcess;
}

/**
 * Spawns a new process using the given `file`.
 * @param {string} file
 * @param {string[]} [args]
 * @param {SpawnProcessOptions} [options]
 * // @param {ChildProcessOptions|import('teen_process').SubProcessOptions} [options]
 * // @returns {import('child_process').ChildProcess|import('teen_process').SubProcess}
 * @returns {SpawnProcess}
 */
export function spawn(file, args, options) {
  log.debug('[spawn]', args, {cwd: options.cwd});
  if (process.env.NODE_NATIVE) {
    return mixinSpawnedProcess(spawnNode(file, args, options));
  }
  /*return new SubProcess(file, args, {
    cwd: __dirname,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });*/
  return mixinSpawnedProcess(new SubProcess(file, args, options));
}

/*
export async function spawn(file, args, options) {
  return new Promise((resolve, reject) => {
    const cmd = file + ' ' + args.join(' ');
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

export const checkEnvironments = (process.env.NODE_ENV === 'development') ? async () => {
  const nodePath = await resolveNodePath();
  // const javaPath = await resolveJavaPath();
  // const javaPath = process.env.JDK_HOME || process.env.JAVA_HOME || await resolveJavaPath();
  const javaPaths = await resolveJavaExecutePaths();
  log.log(`• app path: ${app.getAppPath()}`);
  log.log(`• __dirname: ${__dirname}`);
  log.log(`• root path: ${ROOT_PATH}`);
  log.log(`• Home: ${homedir()}`);
  log.log(`• Temp: ${tmpdir()}`);
  log.log(`• Temp path: ${await promises.realpath(tmpdir())}`);
  log.log(`• TEMP_PATH: ${TEMP_PATH}`);
  log.log(`• APPIUM_HOME: ${join(homedir(), '.aav')}, exists: ${existsSync(join(homedir(), '.aav'))}`);
  log.log(`• USER_APPIUM_HOME: ${process.env.APPIUM_HOME}, exists: ${existsSync(process.env.APPIUM_HOME)}`);
  log.log(`• JAVA_HOME: ${process.env.JAVA_HOME}, exists: ${existsSync(process.env.JAVA_HOME)}`);
  log.log(`• JDK_HOME: ${process.env.JDK_HOME}, exists: ${existsSync(process.env.JDK_HOME)}`);
  log.log(`• java: ${javaPaths.java}, exists: ${existsSync(javaPaths.java)}`);
  log.log(`• javac: ${javaPaths.javac}, exists: ${existsSync(javaPaths.javac)}`);
  log.log(`• Node.js: ${nodePath}, exists: ${existsSync(nodePath)}`);
  log.log(`• ANDROID_HOME: ${process.env.ANDROID_HOME}, exists: ${existsSync(process.env.ANDROID_HOME)}`);
} : async () => {};
