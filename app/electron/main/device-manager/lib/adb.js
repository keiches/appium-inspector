import os from 'os';

import * as _ from '../../endash';

import {DEFAULT_ADB_EXEC_TIMEOUT, getSdkRootFromEnv} from './helpers';
// import log from './logger';
// import type {ADBOptions, ADBExecutable} from './options';

const DEFAULT_ADB_PORT = 5037;
export const DEFAULT_OPTS = {
  sdkRoot: getSdkRootFromEnv(),
  executable: {path: 'adb', defaultArgs: []},
  tmpDir: os.tmpdir(),
  binaries: {},
  adbPort: DEFAULT_ADB_PORT,
  adbExecTimeout: DEFAULT_ADB_EXEC_TIMEOUT,
  remoteAppsCacheLimit: 10,
  allowOfflineDevices: false,
  allowDelayAdb: true,
};

/**
 * Options for executing an ADB command.
 * @typedef {Object} ADBOptions
 * @property {string} platform - The platform of the device.
 * @property {string} device - The device to execute the command on.
 * @property {string} command - The ADB command to execute.
 * @property {string[]} [options] - Additional options to pass to the command.
 * @property {string} [output] - The output file to write the command output to.
 */
/*const ADBOptions = {
  platform: '',
  device: '',
  command: '',
  options: [],
  output: '',
};*/

export class ADB {
  /** @type {string} */
  // adbHost?: string;

  /**
   *
   * @param {ADBOptions} opts
   */
  constructor(opts = {}) {
    /** @type {ADBOptions} */
    const options = _.defaultsDeep(opts, _.cloneDeep(DEFAULT_OPTS));
    _.defaultsDeep(this, options);
    // this.adbHost = null;
  }
}
