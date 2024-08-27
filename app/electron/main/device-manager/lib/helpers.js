/** code from https://github.com/appium/appium-adb/blob/master/lib/helpers.js */
// import fs from 'fs';
import {system, fs, zip, util, tempDir } from '@appium/support';

const APKS_EXTENSION = '.apks';
const APK_EXTENSION = '.apk';
const APK_INSTALL_TIMEOUT = 60000;
const APKS_INSTALL_TIMEOUT = APK_INSTALL_TIMEOUT * 2;
const DEFAULT_ADB_EXEC_TIMEOUT = 20000; // in milliseconds
const MAIN_ACTION = 'android.intent.action.MAIN';
const LAUNCHER_CATEGORY = 'android.intent.category.LAUNCHER';
const MODULE_NAME = 'appium-adb';

/**
 * Retrieves the actual path to SDK root folder from the system environment
 *
 * @return {string|undefined} The full path to the SDK root folder
 */
function getSdkRootFromEnv () {
  return process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
}

/**
 * Retrieves the actual path to SDK root folder
 *
 * @param {string?} [customRoot]
 * @return {Promise<string>} The full path to the SDK root folder
 * @throws {Error} If either the corresponding env variable is unset or is
 * pointing to an invalid file system entry
 */
async function requireSdkRoot (customRoot = null) {
  const sdkRoot = customRoot || getSdkRootFromEnv();
  const docMsg = 'Read https://developer.android.com/studio/command-line/variables for more details';
  if (_.isEmpty(sdkRoot)) {
    throw new Error(`Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported. ${docMsg}`);
  }

  if (!await fs.exists(/** @type {string} */ (sdkRoot))) {
    throw new Error(`The Android SDK root folder '${sdkRoot}' does not exist on the local file system. ${docMsg}`);
  }
  const stats = await fs.stat(/** @type {string} */ (sdkRoot));
  if (!stats.isDirectory()) {
    throw new Error(`The Android SDK root '${sdkRoot}' must be a folder. ${docMsg}`);
  }
  return /** @type {string} */ (sdkRoot);
}

/*export {
  getAndroidPlatformAndPath, unzipFile,
  getIMEListFromOutput, getJavaForOs, isShowingLockscreen, isCurrentFocusOnKeyguard,
  getSurfaceOrientation, isScreenOnFully, buildStartCmd, getJavaHome,
  getSdkToolsVersion, getApksignerForOs, getBuildToolsDirs,
  getApkanalyzerForOs, getOpenSslForOs, extractMatchingPermissions, APKS_EXTENSION,
  APK_INSTALL_TIMEOUT, APKS_INSTALL_TIMEOUT, buildInstallArgs, APK_EXTENSION,
  DEFAULT_ADB_EXEC_TIMEOUT, parseAaptStrings, parseAapt2Strings,
  formatConfigMarker, unsignApk, toAvdLocaleArgs, requireSdkRoot,
  getSdkRootFromEnv, getAndroidPrefsRoot, dirExists, escapeShellArg,
  parseLaunchableActivityNames, matchComponentName, getResourcePath
};*/
export {
  APK_INSTALL_TIMEOUT, APKS_INSTALL_TIMEOUT, APK_EXTENSION,
  DEFAULT_ADB_EXEC_TIMEOUT,
  requireSdkRoot,
  getSdkRootFromEnv,
};
