import {dialog} from 'electron';
// import {EventEmitter} from 'events';
import {existsSync} from 'fs';
import {join} from 'path';
// TODO: will change to 'node:child_process'
import {exec} from 'teen_process';

import {log} from '../logger';
import {getExecutableName, JRM_PATH} from '../utils';
import serverRunner from './server/runner';
import JavaDetector from './test/java-detector';
import NodeDetector from './test/node-detector';
import testRunner from './test/runner';

// const eventEmitter = new EventEmitter();

/**
 * Get Node.Js executable path
 * @returns {Promise<string>}
 */
export async function resolveNodePath() {
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (!nodePath) {
    log.error('Failed to find Node.js executable path');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'node cannot be found',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    log.log(`Node is installed at: ${nodePath}. ${
      (await exec(nodePath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return nodePath;
}

/**
 * Get Java executable path
 * @returns {Promise<string>}
 */
export async function resolveJavaPath() {
  // const nodePath = await resolveExecutablePath('node');
  const javaPath = await JavaDetector.detect();
  if (!javaPath) {
    log.error('Failed to find Java executable path');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'java cannot be found',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    log.log(`Java is installed at: ${javaPath}. ${
      (await exec(javaPath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return javaPath;
}

/**
 * Get Java executable path
 * @returns {Promise<string>}
 */
export async function resolveJavaCompilerPath() {
  const javacPath = await JavaDetector.detect('c');
  if (!javacPath) {
    log.error('Failed to find Java compiler executable path');
    await dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: 'java compiler cannot be found',
    });
  }

  if (process.env.NODE_ENV === 'development') {
    log.log(`Java is installed at: ${javacPath}. ${
      (await exec(javacPath, ['--version'])).stdout.split('\n')[0]
    }`);
  }

  return javacPath;
}

/**
 * Get Java and Java Compiler executable paths
 * @returns {Promise<{java: string; javac: string}>}
 */
export async function resolveJavaExecutePaths() {
  let java;
  let javac;
  // NOTE: java는 설치 상황상, 내장하도록 했다!
  let javaHome = JRM_PATH;
  if (!existsSync(javaHome)) {
    javaHome = process.env.JDK_HOME || process.env.JAVA_HOME;
  }
  if (javaHome) {
    const javaPath = join(javaHome, 'bin');
    java = join(javaPath, getExecutableName('java'));
    if (!existsSync(java)) {
      java = await resolveJavaPath();
    }
    javac = join(javaPath, getExecutableName('javac'));
    if (!existsSync(javac)) {
      javac = await resolveJavaCompilerPath();
    }
  } else {
    java = await resolveJavaPath();
    javac = await resolveJavaCompilerPath();
  }
  return {
    java,
    javac,
  };
}

/**
 * Start Appium server
 * @param {Electron.BrowserWindow} window
 * @returns {Promise<import('child_process').ChildProcess|import('teen_process').SubProcess|undefined>}
 */
export async function startAppiumServer(window) {
  /*eventEmitter.on('appium-server', (...args) => {
    log.debug('[appium-server] event from appium server:', ...args);
    window.webContents.send('appium-server', ...args);
  });*/
  return await serverRunner(window);
}

/**
 * Start message server and test process
 * @param {Electron.BrowserWindow} window
 * @returns {Promise<import('http').Server<import('http').IncomingMessage, import('http').ServerResponse<import('http').IncomingMessage>>>}
 */
export async function startTestServer(window) {
  /*eventEmitter.on('test-server', (...args) => {
    log.debug('[test-server] event from test process:', ...args);
    window.webContents.send('test-server', ...args);
  });*/
  return await testRunner(window);
}
