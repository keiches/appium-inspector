import {log} from './logger';
import which from 'which';
// import {fs, system} from '@appium/support';
// import fs from 'fs';
// import {exec} from 'teen_process';
import {SubProcess} from 'teen_process';
import {constants, promises} from 'fs';
// import {isFunction} from 'lodash';

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
