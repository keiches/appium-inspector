import {log} from '../../logger';
import {resolveExecutablePath} from '../utils';

// Look for java
export class ADBDetector {
  /**
   * @returns {Promise<string|null>}
   */
  static async retrieveUsingSystemCall() {
    const javaPath = await resolveExecutablePath('adb');

    if (!javaPath) {
      log.debug(`ADB binary not found in PATH: ${process.env.PATH}`);
      return null;
    }

    log.debug(`Java binary found at: ${javaPath}`);
    return javaPath;
  }

  /**
   * @returns {Promise<string|null>}
   */
  static async detect() {
    const javaPath = await ADBDetector.retrieveUsingSystemCall();
    if (javaPath) {
      return javaPath;
    } else {
      log.warn('The adb binary could not be found.');
      return null;
    }
  }
}

export default ADBDetector;
