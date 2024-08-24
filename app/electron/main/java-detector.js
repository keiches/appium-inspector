import {log} from './logger';
import {resolveExecutablePath} from './utils';

// Look for java
export class JavaDetector {
  /**
   * @returns {Promise<string|null>}
   */
  static async retrieveUsingSystemCall() {
    const javaPath = await resolveExecutablePath('java');

    if (!javaPath) {
      log.debug(`Java binary not found in PATH: ${process.env.PATH}`);
      return null;
    }

    log.debug(`Java binary found at: ${javaPath}`);
    return javaPath;
  }

  /**
   * @returns {Promise<string|null>}
   */
  static async detect() {
    const javaPath = await JavaDetector.retrieveUsingSystemCall();
    if (javaPath) {
      return javaPath;
    } else {
      log.warn('The java binary could not be found.');
      return null;
    }
  }
}

export default JavaDetector;
