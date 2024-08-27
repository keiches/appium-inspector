import {log} from '../logger.js';
import {resolveExecutablePath} from './utils.js_';

// Look for java
export class JavaDetector {
  /**
   * @param {string} postfix
   * @returns {Promise<string|null>}
   */
  static async retrieveUsingSystemCall(postfix = '') {
    const javaPath = await resolveExecutablePath(`java${postfix}`);

    if (!javaPath) {
      log.debug(`Java binary not found in PATH: ${process.env.PATH}`);
      return null;
    }

    log.debug(`Java binary found at: ${javaPath}`);
    return javaPath;
  }

  /**
   * @param {string} [postfix]
   * @returns {Promise<string|null>}
   */
  static async detect(postfix) {
    const javaPath = await JavaDetector.retrieveUsingSystemCall(postfix);
    if (javaPath) {
      return javaPath;
    } else {
      log.warn('The java binary could not be found.');
      return null;
    }
  }
}

export default JavaDetector;
