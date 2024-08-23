import {app} from 'electron';
import which from 'which';
// import {fs, system} from '@appium/support';
// import fs from 'fs';
// import {exec} from 'teen_process';
import {SubProcess} from 'teen_process';
import {constants, promises, realpathSync, } from 'fs';
import {tmpdir} from 'os';
// import {isFunction} from 'lodash';
import {log} from './logger';
import {randomBytes, randomUUID} from 'crypto';
// import {v4} from 'uuid';

// NOTE: in renderer/preload, use "remote.app.getAppPath()".
export const ROOT_PATH = process.env.NODE_ENV === 'development' ? app.getAppPath() : __dirname;
// appium-app-validator\client
// appium-app-validator\client\dist\main

// NOTE: normally use tmpdir is ok, but macOS/Linux does not return actual temp dir.
export const TEMP_PATH = realpathSync(tmpdir(), {encoding: 'utf8'});

export const uuid = (typeof randomUUID === 'function') ? randomUUID : () => randomBytes(16).toString('hex');
/*
export const uuid = () => {
  const tokens = v4().split('-');
  return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
};
*/

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
 *
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {import('teen_process').SubProcessOptions} [opts]
 */
export function spawn(cmd, args, opts) {
  /*return new SubProcess(cmd, args, {
    cwd: __dirname,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });*/
  return new SubProcess(cmd, args, opts);
}

