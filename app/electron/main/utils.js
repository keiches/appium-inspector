import {app, dialog} from 'electron';
import which from 'which';
// import {fs, system} from '@appium/support';
// import fs from 'fs';
// import {exec} from 'teen_process';
import {exec, SubProcess} from 'teen_process';
import {constants, existsSync, promises, realpathSync} from 'fs';
import {homedir, platform, tmpdir} from 'os';
// import {isFunction} from 'lodash';
import {log} from './logger';
import {randomBytes, randomUUID} from 'crypto';
import {join} from 'path';
import {spawn as spawnNode} from 'child_process';
import NodeDetector from './test/node-detector';
import JavaDetector from './test/java-detector';
// import {v4} from 'uuid';

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
  if (platform() === 'win32') {
    return `${name}.exe`;
  }
  return name;
};

async function exists(path) {
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
 * Spawns a new process using the given `file`.
 * @param {string} file
 * @param {string[]} [args]
 * @param {import('teen_process').SubProcessOptions} [options]
 * @returns {ChildProcess|import('teen_process').SubProcess}
 */
export function spawn(file, args, options) {
  /*return new SubProcess(file, args, {
    cwd: __dirname,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });*/
  if (process.env.NODE_NATIVE) {
    return spawnNode(file, args, options);
  }
  return new SubProcess(file, args, options);
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

/**
 * Return an executable path of cmd
 *
 * @param {string} cmd Standard output by command
 * @return {Promise<string|null>} The full path of cmd. `null` if the cmd is not found.
 */
export async function resolveExecutablePath(cmd) {
  let executablePath;
  try {
    executablePath = await which(cmd);
    if (executablePath && (await exists(executablePath))) {
      return executablePath;
    }
  } catch (err) {
    if (/not found/gi.test(err.message)) {
      log.debug(err);
    } else {
      log.warn(err);
    }
  }
  log.debug(`No executable path of '${cmd}'.`);
  if (executablePath) {
    log.debug(`Does '${executablePath}' exist?`);
  }
  return null;
}

/**
 * Get Node.Js executable path
 * @returns {Promise<string>}
 */
export async function resolveNodePath() {
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

  if (process.env.NODE_ENV === 'development') {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec(nodePath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return nodePath;
}

/**
 * Get Java executable path
 * @returns {Promise<string>}
 */
export async function resolveJavaPath() {
  // const nodePath = await resolveExecutablePath('node');
  const javaPath = await JavaDetector.detect();
  if (!javaPath) {
    log.error('java cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'java cannot be found',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    log.log(`Java is installed at: ${javaPath}. ${
      (await exec(javaPath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return javaPath;
}

/**
 * Get Java executable path
 * @returns {Promise<string>}
 */
export async function resolveJavaCompilerPath() {
  const javacPath = await JavaDetector.detect('c');
  if (!javacPath) {
    log.error('java compiler cannot be found');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'java compiler cannot be found',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    log.log(`Java is installed at: ${javacPath}. ${
      (await exec(javacPath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return javacPath;
}

/**
 * Get Java and Java Compiler executable paths
 * @returns {Promise<{javac: (Promise<string>|string), java: (Promise<string>|string)}>}
 */
export async function resolveJavaExecutePaths() {
  let java;
  let javac;
  // NOTE: java는 설치 상황상, 내장하도록 했다!
  let javaHome = JRM_PATH;
  if (!existsSync(javaHome)) {
    javaHome = process.env.JDK_HOME || process.env.JAVA_HOME;
  }
  if (javaHome) {
    const javaPath = join(javaHome, 'bin');
    java = join(javaPath, getExecutableName('java'));
    if (!existsSync(java)) {
      java = resolveJavaPath();
    }
    javac = join(javaPath, getExecutableName('javac'));
    if (!existsSync(javac)) {
      javac = resolveJavaCompilerPath();
    }
  } else {
    java = resolveJavaPath();
    javac = resolveJavaCompilerPath();
  }
  return {
    java,
    javac,
  };
}

export const checkEnvironments = (process.env.NODE_ENV === 'development') ? async () => {
  const nodePath = await resolveNodePath();
  // const javaPath = await resolveJavaPath();
  // const javaPath = process.env.JDK_HOME || process.env.JAVA_HOME || await resolveJavaPath();
  const javaPaths = await resolveJavaExecutePaths();
  log.log(`----app path: ${app.getAppPath()}`);
  log.log(`----__dirname: ${__dirname}`);
  log.log(`----root path: ${ROOT_PATH}`);
  log.log(`----Home: ${homedir()}`);
  log.log(`----Temp: ${tmpdir()}`);
  log.log(`----Temp path: ${await promises.realpath(tmpdir())}`);
  log.log(`----TEMP_PATH: ${TEMP_PATH}`);
  log.log(`----WORKING_HOME: ${join(homedir(), '.aav')}`);
  log.log(`----WORKING_HOME exists: ${existsSync(join(homedir(), '.aav'))}`);
  log.log(`----APPIUM_HOME: ${process.env.APPIUM_HOME}`);
  log.log(`----APPIUM_HOME exists: ${existsSync(process.env.APPIUM_HOME)}`);
  log.log(`----JAVA_HOME: ${process.env.JAVA_HOME}`);
  log.log(`----JAVA_HOME exists: ${existsSync(process.env.JAVA_HOME)}`);
  log.log(`----JDK_HOME: ${process.env.JDK_HOME}`);
  log.log(`----JDK_HOME exists: ${existsSync(process.env.JDK_HOME)}`);
  log.log(`----java: ${javaPaths.java}`);
  log.log(`----javac exists: ${existsSync(javaPaths.java)}`);
  log.log(`----javac: ${javaPaths.javac}`);
  log.log(`----javac exists: ${existsSync(javaPaths.javac)}`);
  log.log(`----Node.js: ${nodePath}`);
  log.log(`----Node.js exists: ${existsSync(nodePath)}`);
  log.log(`----ANDROID_HOME: ${process.env.ANDROID_HOME}`);
  log.log(`----ANDROID_HOME exists: ${existsSync(process.env.ANDROID_HOME)}`);
} : async () => {};

/**
 * Convert date to formatted string
 * @param date
 * @returns {string}
 */
export function toFormattedString(date) {
  return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
}

Date.prototype.toFormattedString = function toFormattedString() {
  return toFormattedString(this);
};
