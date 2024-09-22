import which from 'which';

import {log} from '../logger.js';
import {exists, getExecutableName} from '../utils';

/**
 * Return an executable path of cmd
 *
 * @param {string} cmd Standard output by command
 * @return {Promise<string|null>} The full path of cmd. `null` if the cmd is not found.
 */
export async function resolveExecutablePath(cmd) {
  let executablePath;
  try {
    executablePath = await which(getExecutableName(cmd));
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
    log.debug(`Does "${executablePath}" exist?`);
  }
  return null;
}
