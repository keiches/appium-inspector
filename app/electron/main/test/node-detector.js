import {log} from '../logger.js';
import {resolveExecutablePath} from './utils.js_';

// Look for node
export class NodeDetector {
  /**
   * @returns {Promise<string|null>}
   */
  static async retrieveUsingSystemCall() {
    const nodePath = await resolveExecutablePath('node');

    if (!nodePath) {
      log.debug(`Node binary not found in PATH: ${process.env.PATH}`);
      return null;
    }

    log.debug(`Node binary found at: ${nodePath}`);
    return nodePath;
  }

  /**
   * @returns {Promise<string|null>}
   */
  static async detect() {
    const nodePath = await NodeDetector.retrieveUsingSystemCall();
    if (nodePath) {
      return nodePath;
    } else {
      log.warn('The node binary could not be found.');
      return null;
    }
  }
}

export default NodeDetector;
