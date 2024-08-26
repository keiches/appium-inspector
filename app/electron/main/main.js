import {app, dialog} from 'electron';
import debug from 'electron-debug';
import {existsSync, promises} from 'fs';

// import {installExtensions} from './debug';
import {getAppiumSessionFilePath, isDev} from './helpers';
import {setupMainWindow} from './windows';
import NodeDetector from './node-detector';
// import server from '../server/build/lib/main.js';
// import which from 'which';
// import fs from 'node:fs';
// import {fs} from '@appium/support';
// import {exec, spawn} from 'node:child_process';
import {spawn} from 'child_process';
import {join, resolve} from 'path';
import {homedir, tmpdir, platform} from 'os';
// import _logger from 'console';
import {exec} from 'teen_process';
import {log} from './logger';
import {getDevices} from './device-manager';
import generator, {ANDROID_VERSIONS} from './test/generator';
import {
  JRM_PATH,
  PACKAGES_PATH,
  ROOT_PATH,
  TEMP_PATH,
  TESTER_LIBS_PATH,
  TESTER_PATH,
  TESTER_TEMP_PATH,
  uuid
} from './utils';
import JavaDetector from './java-detector';
// import {spawn} from './utils';

// const log = console || _logger;

export let openFilePath = getAppiumSessionFilePath(process.argv, app.isPackaged);

let server;
let actionTester;

app.on('open-file', (event, filePath) => {
  openFilePath = filePath;
});

app.on('window-all-closed', () => {
  if (actionTester && !actionTester.killed) {
    log.log('Terminate actions runner...');
    actionTester.kill('SIGTERM');
    actionTester = null;
  }
  if (server && !server.killed) {
    log.log('Terminate Appium server...');
    server.kill('SIGTERM'); // NodeJS.Signals
    // process.kill(server.pid, 'SIGINT');
    server = null;
  }
  app.quit();
});

/*
async function spawn(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({stdout, stderr});
      }
    });
  });
}
*/

/**
 * Get Node.Js executable path
 * @returns {Promise<string>}
 */
async function resolveNodePath() {
  // const nodePath = await resolveExecutablePath('node');
  const nodePath = await NodeDetector.detect();
  if (!nodePath) {
    log.error('node cannot be found');
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
async function resolveJavaPath() {
  // const nodePath = await resolveExecutablePath('node');
  const javaPath = await JavaDetector.detect();
  if (!javaPath) {
    log.error('java cannot be found');
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
async function resolveJavaCompilerPath() {
  const javacPath = await JavaDetector.detect('c');
  if (!javacPath) {
    log.error('java compiler cannot be found');
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
 * Get executable name by platform os
 * @param {string} name
 * @return {string}
 */
const getExecutableName = (name) => {
  if (platform() === 'win32') {
    return `${name}.exe`;
  }
  return name;
}

const resolveJavaExecutePaths = async () => {
  let java;
  let javac;
  const javaHome = process.env.JDK_HOME || process.env.JAVA_HOME;
  if (javaHome) {
    const javaPath = join(javaHome, 'bin');
    java = join(javaPath, getExecutableName('java'));
    if (!existsSync(java)) {
      java = resolveJavaPath();
    }
    javac = join(javaPath, getExecutableName('javac'));
    if (!existsSync(javac)) {
      javac = resolveJavaCompilerPath();
    }
  } else {
    java = resolveJavaPath();
    javac = resolveJavaCompilerPath();
  }
  return {
    java,
    javac,
  };
}

const checkEnvironments = (process.env.NODE_ENV === 'development') ? async () => {
  const nodePath = await resolveNodePath();
  // const javaPath = await resolveJavaPath();
  // const javaPath = process.env.JDK_HOME || process.env.JAVA_HOME || await resolveJavaPath();
  const javaPaths = await resolveJavaExecutePaths();
  log.log(`----app path: ${app.getAppPath()}`);
  log.log(`----__dirname: ${__dirname}`);
  log.log(`----root path: ${ROOT_PATH}`);
  log.log(`----Home: ${homedir()}`);
  log.log(`----Temp: ${tmpdir()}`);
  log.log(`----Temp path: ${await promises.realpath(tmpdir())}`);
  log.log(`----TEMP_PATH: ${TEMP_PATH}`);
  log.log(`----WORKING_HOME: ${join(homedir(), '.aav')}`);
  log.log(`----WORKING_HOME exists: ${existsSync(join(homedir(), '.aav'))}`);
  log.log(`----APPIUM_HOME: ${process.env.APPIUM_HOME}`);
  log.log(`----APPIUM_HOME exists: ${existsSync(process.env.APPIUM_HOME)}`);
  log.log(`----JAVA_HOME: ${process.env.JAVA_HOME}`);
  log.log(`----JAVA_HOME exists: ${existsSync(process.env.JAVA_HOME)}`);
  log.log(`----JDK_HOME: ${process.env.JDK_HOME}`);
  log.log(`----JDK_HOME exists: ${existsSync(process.env.JDK_HOME)}`);
  log.log(`----java: ${javaPaths.java}`);
  log.log(`----javac exists: ${existsSync(javaPaths.java)}`);
  log.log(`----javac: ${javaPaths.javac}`);
  log.log(`----javac exists: ${existsSync(javaPaths.javac)}`);
  log.log(`----Node.js: ${nodePath}`);
  log.log(`----Node.js exists: ${existsSync(nodePath)}`);
  log.log(`----ANDROID_HOME: ${process.env.ANDROID_HOME}`);
  log.log(`----ANDROID_HOME exists: ${existsSync(process.env.ANDROID_HOME)}`);
} : async () => {};

/**
 * Execute Appium server in background
 * @returns {Promise<void>}
 */
async function runAppiumServer() {
  log.log('Starting Appium server...');
  /*const controller = new AbortController();
  const { signal } = controller;
  server = fork('../server/build/lib/main.js', [], {*/
  /*server = fork('node', ['../server/build/lib/main'], {
    // signal,
    stdio: ['pipe', 'inherit', 'inherit'],
  });*/
  const nodePath = await resolveNodePath();

  // server = spawn(nodePath, [join(__dirname, '../server/build/lib/main.js')]/*, {
  // server = spawn(nodePath, ['../node_modules/appium/build/lib/main.js']/*, {
  server = spawn(nodePath, [
    // isDev ? '-inspect' : '',
    // TODO: set actual appium server path
    join(PACKAGES_PATH, 'server', 'packages', 'appium', 'build', 'lib', 'main.js'),
    // resolve(join('..', 'server', 'packages', 'appium')),
    // ../server/packages/appium
    'server',
    // '--show-config'
    '--config',
    join(ROOT_PATH, 'configs', 'server.conf.js'),
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    // stdio: ['ignore', openSync('stdout_server.txt', 'w'), openSync('stderr_server.txt', 'w')],
    // stdio: ['pipe', 'inherit', 'inherit']
    // shell: true,
    // cwd: 'C:\\Test\\Path',
    // detached: true, ==> server.unref();
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않는 듯함
    env: {
      // ...process.env,
      // 'APPIUM_HOME': join(__dirname, '.appium'),
      APPIUM_HOME: resolve(homedir(), '.aav'),
      ANDROID_HOME: 'C:\\opt\\Android\\Sdk', // process.env.ANDROID_HOME,
    },
  });

  server.stdout?.setEncoding?.('utf-8');
  server.stdout.on('data', (data) => {
    // if we get here, all we know is that the proc exited
    log.log(`[appium-server] stdout: ${data}`);
    // exited with code 127 from signal SIGHUP
  });

  server.stderr?.setEncoding?.('utf-8');
  server.stderr.on('data', (data) => {
    log.error(`[appium-server] stderr: ${data}`);
  });

  server.on('message', (message) => {
    log.log('[appium-server] message:' + message);
  });

  server.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[appium-server] error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  server.on('disconnect', () => {
    log.warn('[appium-server] disconnect');
  });

  server.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[appium-server] closed with code ${code} from signal ${signal}`);
  });

  server.on('exit', (code) => {
    log.log('[appium-server] exit on code: ' + code);
  });

  log.log(`[appium-server] spawned: ${server.pid}`);
}

/*
function getClassPath(androidVersion) {
  return `libs/android${android.version}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;`.replace(/libs\//g, `${ROOT_PATH}/libs/`);
}
*/

/**
 * Execute action tester in background
 * @returns {Promise<void>}
 */
async function runActionTester() {
  log.log('Running action tester...', await resolveJavaPath());
  log.log(`----0>>> ${ROOT_PATH}`);
  log.log(`----1>>> ${await promises.realpath(ROOT_PATH)}`);
  // log.log(`----2>>> ${join(PACKAGES_PATH, 'actions-tester', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`)}`);

  const {dest, copied} = await generator({
    androidVersion: '12',
    codes: `// Test Action #1
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.ImageView' and ./parent::*[@class='android.view.ViewGroup'] and (./preceding-sibling::* | ./following-sibling::*)[@text='Sauce Labs Backpack']]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//*[@contentDescription='Add To Cart button']")));
// Test Action #2
driver.findElement(AppiumBy.xpath("//*[@contentDescription='Add To Cart button']")).click();
// new WebDriverWait(driver, 30).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//*[@id='back']")));
// Test Action #3
driver.findElement(AppiumBy.xpath("//*[@id='back']")).click();
// Test Action #4
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.ImageView' and ./parent::*[@class='android.view.ViewGroup'] and (./preceding-sibling::* | ./following-sibling::*)[@text='Sauce Labs Bike Light']]")).click();
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.ImageView' and ./parent::*[@contentDescription='counter plus button']]")).click();
driver.findElement(AppiumBy.xpath("//*[@contentDescription='Add To Cart button']")).click();
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.ImageView' and ./parent::*[@contentDescription='cart badge']]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//*[@text='Proceed To Checkout']")));
driver.findElement(AppiumBy.xpath("//*[@text='Proceed To Checkout']")).click();
driver.findElement(AppiumBy.xpath("//*[@contentDescription='Username input field']")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("(//*[@id='key_pos_0_5']/*[@class='android.widget.TextView'])[1]")));
driver.findElement(AppiumBy.xpath("(//*[@id='key_pos_0_5']/*[@class='android.widget.TextView'])[1]")).click();
driver.findElement(AppiumBy.xpath("(//*[@id='key_pos_0_8']/*[@class='android.widget.TextView'])[1]")).click();
driver.findElement(AppiumBy.xpath("(//*[@id='key_pos_0_6']/*[@class='android.widget.TextView'])[1]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//*[@contentDescription='Password input field']")));
driver.findElement(AppiumBy.xpath("//*[@contentDescription='Password input field']")).click();
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.TextView' and ./parent::*[@id='key_pos_2_7']]")).click();
driver.findElement(AppiumBy.xpath("//*[@class='android.widget.TextView' and ./parent::*[@id='key_pos_0_2']]")).click();
driver.findElement(AppiumBy.xpath("//*[@text='Login' and ./parent::*[@contentDescription='Login button']]")).click();`,
    remoteAddress: 'http://localhost:4723', // 'host:port'
    capabilities: {
      app: 'C:\\\\Users\\\\keiches\\\\Projects\\\\sptek\\\\appium-app-validator\\\\apks\\\\Android-MyDemoAppRN.1.3.0.build-244.apk',
      appPackage: 'com.saucelabs.mydemoapp.rn',
      appActivity: '.MainActivity',
      deviceName: 'emulator-5554',
    },
  });
  // eslint-disable-next-line
  console.log('----0', dest, copied?.length ?? 0);

  if (!dest) {
    return;
  }

  /** @type {string} */
  let command;
  /** @type {string[]} */
  let args;
  /** @type {Record<string, any>} */
  let options;
  if (platform() === 'win32') {
    command = 'cmd.exe';
    args = [
      '/c',
      join(TESTER_PATH, 'compile.cmd'),
      dest,
    ];
  } else {
    command = 'bash';
    args = [
      join(TESTER_PATH, 'compile.sh'),
      dest,
    ];
  }
  options = {
    // detached: true, ==> actionsTester.unref();
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    // stdio: ['ignore', openSync('stdout_tester.txt', 'w'), openSync('stderr_tester.txt', 'w')],
    // stdio: ['pipe', 'ignore', 'inherit']
    // stdio: [Stdin, Stdout, Stderr];
    // shell: true,
    // cwd: 'C:\\Test\\Path',
    // cwd: dest,
    cwd: TESTER_PATH,
    env: {
      // ...process.env,
      // CLASSPATH: 'libs/android{{android.version}}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      // CLASSPATH: 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      JAVA_HOME: JRM_PATH,
    }
  };

  const androidVersion = '12';
  // #1 compile java to class
  // actionTester = spawn(command, args, options);
  actionTester = spawn(join(JRM_PATH, 'bin', getExecutableName('javac')), [
    // isDev ? '-verbose' : '',
    '-d',
    join(dest, 'out'),
    '--class-path',
    // TODO: 더 좋은 방법을 강구하자...
    // 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/')),
    `${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}`,
    // `--class-path ${getClassPath()}`,
    // '%CLASSPATH%',
    join(dest, 'src/test/java/com/sptek/appium/UnitTest.java'),
  ], options);

  actionTester.stdout?.setEncoding?.('utf-8');
  actionTester.stdout.on('data', (chunk) => {
    // if we get here, all we know is that the proc exited
    log.log(`[actions-tester] compiler stdout: ${chunk?.toString()}`);
    // exited with code 127 from signal SIGHUP
  });

  actionTester.stderr?.setEncoding?.('utf-8');
  actionTester.stderr.on('data', (chunk) => {
    const content = Buffer.concat([chunk]).toString();
    console.log('--------', content);
    log.error(`[actions-tester] compiler stderr: ${chunk?.toString()}`);
  });

  actionTester.on('message', (message) => {
    log.log('[actions-tester] compiler message:' + message);
  });

  actionTester.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[actions-tester] compiler error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  actionTester.on('disconnect', () => {
    log.warn('[actions-tester] compiler disconnect');
  });

  actionTester.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[actions-tester] compiler closed with code ${code} from signal ${signal}`);
    if (signal === null) {
      log.log('Test runner compiled');
      // TODO: when compiling is done successfully, start running
      setTimeout(() => {
        actionTester.unref();
        log.log('Starting test runner...');
        // #2 run class
        /*actionTester = spawn(join(__dirname, '..', 'libs', 'actions-tester', 'run'), [
          dest,
        ], {
          // detached: true, ==> actionsTester.unref();
          detached: true,
          stdio: ['pipe', 'inherit', 'inherit'],
          // shell: true,
          // cwd: 'C:\\Test\\Path',
          cwd: dest,
        });*/
        actionTester = spawn(join(JRM_PATH, 'bin', getExecutableName('java')), [
          // isDev ? '-verbose' : '',
          '-jar',
          'libs/junit-platform-console-standalone-1.10.3.jar'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/')),
          'execute',
          // '--class-path=%CLASSPATH%out',
          // TODO: 더 좋은 방법을 강구하자...
          // `--class-path=${'libs/android.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          `--class-path=${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          '--select-class=com.sptek.appium.UnitTest',
        ], options);

        actionTester.stdout?.setEncoding?.('utf-8');
        actionTester.stdout.on('data', (data) => {
          // if we get here, all we know is that the proc exited
          log.log(`[actions-tester] runner stdout: ${data}`);
          // exited with code 127 from signal SIGHUP
        });

        actionTester.stderr?.setEncoding?.('utf-8');
        actionTester.stderr.on('data', (data) => {
          log.error(`[actions-tester] runner stderr: ${data}`);
        });

        actionTester.on('message', (message) => {
          log.log('[actions-tester] message:' + message);
        });

        actionTester.on('error', (err) => {
          // This will be called with err being an AbortError if the controller aborts
          log.error('[actions-tester] runner error:' + err.toString());
          dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: err.message,
          });
        });

        actionTester.on('disconnect', () => {
          log.warn('[actions-tester] runner disconnect');
        });

        actionTester.on('close', (code, signal) => {
          // if we get here, we know that the process stopped outside our control
          // but with a 0 exit code
          // app.quit();
          log.log(`[actions-tester] runner closed with code ${code} from signal ${signal}`);
          if (code === 0 && signal === null) {
            // TODO: when compiling is done successfully, start running
            log.log('Test runner stopped');
          } else {
            // TODO: send reasons about failed to run
            log.error(`Failed to run test runner with code ${code} from signal ${signal}`);
          }
        });

        actionTester.on('exit', (code, signal) => {
          log.log(`[actions-tester] runner existed with code ${code} from signal ${signal}`);
        });

        log.log(`[actions-tester] runner spawned: ${actionTester.pid}`);
      }, 1);
    } else {
      // TODO: send reasons about failed to compile
      log.error(`Failed to compile test runner with error ${signal}`);
    }
  });

  actionTester.on('exit', (code, signal) => {
    log.log(`[actions-tester] compiler existed with code ${code} from signal ${signal}`);
  });

  log.log(`[actions-tester] compiler spawned: ${actionTester.pid}`);
}

// launchinfo for Windows, Linux
// app.on('will-finish-launch', () => {});
// launchinfo for macOS
app.on('ready', async () => {
  if (isDev) {
    await checkEnvironments();
    debug();
    // TODO: uncomment this after upgrading to Electron 15+
    // await installExtensions();
  }
  await resolveNodePath();

  // @site: https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  // await runAppiumServer();

  // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
  await runActionTester();

  await getDevices();

  setupMainWindow();
});
