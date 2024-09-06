import _ from 'lodash';
import os from 'os';
import methods, { getAndroidBinaryPath } from './tools';
import { DEFAULT_ADB_EXEC_TIMEOUT, requireSdkRoot, getSdkRootFromEnv } from './helpers';
import {log} from '../../logger.js';

const DEFAULT_ADB_PORT = 5037;
export const DEFAULT_OPTS = {
  sdkRoot: getSdkRootFromEnv(),
  executable: { path: 'adb', defaultArgs: [] },
  tmpDir: os.tmpdir(),
  binaries: {},
  adbPort: DEFAULT_ADB_PORT,
  adbExecTimeout: DEFAULT_ADB_EXEC_TIMEOUT,
  remoteAppsCacheLimit: 10,
  allowOfflineDevices: false,
  allowDelayAdb: true,
};

export class ADB {
  constructor(opts = {}) {
    const options = _.defaultsDeep(opts, _.cloneDeep(DEFAULT_OPTS));
    Object.assign(this, options);

    this.executable = options.executable;

    if (options.remoteAdbHost) {
      this.executable.defaultArgs.push('-H', options.remoteAdbHost);
      this.adbHost = options.remoteAdbHost;
    }
    if (options.remoteAdbPort) {
      this.adbPort = options.remoteAdbPort;
    }
    this.executable.defaultArgs.push('-P', String(this.adbPort));
    if (options.udid) {
      this.setDeviceId(options.udid);
    }
  }

  clone(opts = {}) {
    const originalOptions = _.cloneDeep(_.pick(this, Object.keys(DEFAULT_OPTS)));
    const cloneOptions = _.defaultsDeep(opts, originalOptions);

    const defaultArgs = cloneOptions.executable.defaultArgs;
    if (cloneOptions.remoteAdbHost && defaultArgs.includes('-H')) {
      defaultArgs.splice(defaultArgs.indexOf('-H'), 2);
    }
    if (defaultArgs.includes('-P')) {
      defaultArgs.splice(defaultArgs.indexOf('-P'), 2);
    }

    return new ADB(cloneOptions);
  }

  static async createADB(opts = {}) {
    const adb = new ADB(opts);
    adb.sdkRoot = await requireSdkRoot(adb.sdkRoot);
    await adb.getAdbWithCorrectAdbPath();
    if (!opts?.suppressKillServer) {
      try {
        await adb.adbExec(['start-server']);
      } catch (e) {
        log.warn(e.stderr || e.message);
      }
    }
    return adb;
  }
}

Object.assign(ADB.prototype, methods);

export { DEFAULT_ADB_PORT, getAndroidBinaryPath, getSdkRootFromEnv };
