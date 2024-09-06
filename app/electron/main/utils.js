import {app} from 'electron';

import {SubProcess} from 'teen_process';
import {constants, existsSync, promises, realpathSync} from 'fs';
import {homedir, platform, tmpdir} from 'os';
// import {isFunction} from 'lodash';
import {log} from './logger';
import {randomBytes, randomUUID} from 'crypto';
import {join} from 'path';
import {spawn as spawnNode} from 'child_process';
import {resolveJavaExecutePaths, resolveNodePath} from './services';
// import {v4} from 'uuid';

import './prototype-date';

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
  if (process.env.NODE_EXTENDS) {
    return new SubProcess(file, args, options);
  }
  return spawnNode(file, args, options);
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
  log.log(`----app path: ${app.getAppPath()}`);
  log.log(`----__dirname: ${__dirname}`);
  log.log(`----root path: ${ROOT_PATH}`);
  log.log(`----Home: ${homedir()}`);
  log.log(`----Temp: ${tmpdir()}`);
  log.log(`----Temp path: ${await promises.realpath(tmpdir())}`);
  log.log(`----TEMP_PATH: ${TEMP_PATH}`);
  log.log(`----WORKING_HOME: ${join(homedir(), '.appium')}`);
  log.log(`----WORKING_HOME exists: ${existsSync(join(homedir(), '.appium'))}`);
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
