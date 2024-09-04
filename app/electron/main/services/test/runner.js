import {dialog} from 'electron';
import {openSync} from 'fs';
import {join} from 'path';

import {isDev} from '../../helpers';
import {log} from '../../logger';
import {JRM_PATH, TESTER_LIBS_PATH, TESTER_PATH, spawn} from '../../utils';
import ANDROID_VERSIONS from './android-versions';
import generator from './generator';
import {resolveJavaExecutePaths} from '../index';
import {ProcessAbortController} from '../abort-controller.js';

/**
 * Execute action tester in background
 * @returns {Promise<void>}
 */
/*
async function runActionTester() {
  log.log('Running action tester...', await resolveJavaPath());
  log.log(`----0>>> ${ROOT_PATH}`);
  log.log(`----1>>> ${await promises.realpath(ROOT_PATH)}`);
  // log.log(`----2>>> ${join(PACKAGES_PATH, 'actions-tester', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`)}`);

  const {dest, copied} = await generator({
    targetVersion: '12',
    codes: `// Test Action #1
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.ImageView' and ./parent::*[@class='android.view.ViewGroup'] and (./preceding-sibling::* | ./following-sibling::*)[@text='Sauce Labs Backpack']]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//!*[@contentDescription='Add To Cart button']")));
// Test Action #2
driver.findElement(AppiumBy.xpath("//!*[@contentDescription='Add To Cart button']")).click();
// new WebDriverWait(driver, 30).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//!*[@id='back']")));
// Test Action #3
driver.findElement(AppiumBy.xpath("//!*[@id='back']")).click();
// Test Action #4
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.ImageView' and ./parent::*[@class='android.view.ViewGroup'] and (./preceding-sibling::* | ./following-sibling::*)[@text='Sauce Labs Bike Light']]")).click();
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.ImageView' and ./parent::*[@contentDescription='counter plus button']]")).click();
driver.findElement(AppiumBy.xpath("//!*[@contentDescription='Add To Cart button']")).click();
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.ImageView' and ./parent::*[@contentDescription='cart badge']]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//!*[@text='Proceed To Checkout']")));
driver.findElement(AppiumBy.xpath("//!*[@text='Proceed To Checkout']")).click();
driver.findElement(AppiumBy.xpath("//!*[@contentDescription='Username input field']")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("(//!*[@id='key_pos_0_5']/!*[@class='android.widget.TextView'])[1]")));
driver.findElement(AppiumBy.xpath("(//!*[@id='key_pos_0_5']/!*[@class='android.widget.TextView'])[1]")).click();
driver.findElement(AppiumBy.xpath("(//!*[@id='key_pos_0_8']/!*[@class='android.widget.TextView'])[1]")).click();
driver.findElement(AppiumBy.xpath("(//!*[@id='key_pos_0_6']/!*[@class='android.widget.TextView'])[1]")).click();
// new WebDriverWait(driver, 10).until(ExpectedConditions.presenceOfElementLocated(AppiumBy.xpath("//!*[@contentDescription='Password input field']")));
driver.findElement(AppiumBy.xpath("//!*[@contentDescription='Password input field']")).click();
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.TextView' and ./parent::*[@id='key_pos_2_7']]")).click();
driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.TextView' and ./parent::*[@id='key_pos_0_2']]")).click();
driver.findElement(AppiumBy.xpath("//!*[@text='Login' and ./parent::*[@contentDescription='Login button']]")).click();`,
    capabilities: {
      app: join(ROOT_PATH, 'apps', 'Android-MyDemoAppRN.1.3.0.build-244.apk'),
      appPackage: 'com.saucelabs.mydemoapp.rn',
      appActivity: '.MainActivity',
      deviceName: 'emulator-5554',
    },
    remoteAddress: 'http://localhost:4723', // 'host:port'
  });
  // eslint-disable-next-line
  console.log('----0', dest, copied?.length ?? 0);

  if (!dest) {
    return;
  }

  const fileIndex = (new Date()).toFormattedString(); // toFormattedString(new Date());
  /!** @type {Record<string, any>} *!/
  const options = {
    // detached: true, ==> actionsTester.unref();
    detached: true,
    // stdio: ['pipe', 'pipe', 'pipe'],
    stdio: ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')],
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
  testerProcess = spawn(join(JRM_PATH, 'bin', getExecutableName('javac')), [
    // isDev ? '-verbose' : '',
    '-d',
    join(dest, 'out'),
    '--class-path',
    // TODO: 더 좋은 방법을 강구하자...
    // 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/')),
    `${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}`,
    // `--class-path ${getClassPath()}`,
    // '%CLASSPATH%',
    join(dest, 'src/test/java/com/sptek/appium/AndroidUnitTest.java'),
  ], options);

  testerProcess.stdout?.setEncoding?.('utf-8');
  options.stdio[1] === 'pipe' && testerProcess.stdout.on('data', (/!** @type {Buffer} *!/ chunk) => {
    // if we get here, all we know is that the proc exited
    log.log(`[actions-tester] compiler stdout: ${chunk?.toString()}`);
    // exited with code 127 from signal SIGHUP
  });

  testerProcess.stderr?.setEncoding?.('utf-8');
  options.stdio[2] === 'pipe' && testerProcess.stderr.on('data', (/!** @type {Buffer} *!/ chunk) => {
    /!*const content = Buffer.concat([chunk]).toString();
    console.log('--------', content);*!/
    log.error(`[actions-tester] compiler stderr: ${chunk?.toString()}`);
  });

  testerProcess.on('message', (message) => {
    log.log('[actions-tester] compiler message:' + message);
  });

  testerProcess.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[actions-tester] compiler error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  testerProcess.on('disconnect', () => {
    log.warn('[actions-tester] compiler disconnect');
  });

  testerProcess.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[actions-tester] compiler closed with code ${code} from signal ${signal}`);
    if (signal === null) {
      log.log('Test runner compiled');
      // TODO: when compiling is done successfully, start running
      setTimeout(() => {
        testerProcess.unref();
        log.log('Starting test runner...');
        // #2 run class
        options.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')];
        /!*actionTester = spawn(join(__dirname, '..', 'libs', 'actions-tester', 'run'), [
          dest,
        ], {
          // detached: true, ==> actionsTester.unref();
          detached: true,
          stdio: ['pipe', 'inherit', 'inherit'],
          // shell: true,
          // cwd: 'C:\\Test\\Path',
          cwd: dest,
        });*!/
        testerProcess = spawn(join(JRM_PATH, 'bin', getExecutableName('java')), [
          // isDev ? '-verbose' : '',
          '-jar',
          'libs/junit-platform-console-standalone-1.10.3.jar'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/')),
          'execute',
          // '--class-path=%CLASSPATH%out',
          // TODO: 더 좋은 방법을 강구하자...
          // `--class-path=${'libs/android.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          `--class-path=${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          '--select-class=com.sptek.appium.AndroidUnitTest',
        ], options);

        testerProcess.stdout?.setEncoding?.('utf-8');
        options.stdio[1] === 'pipe' && testerProcess.stdout.on('data', (/!** @type {Buffer} *!/ chunk) => {
          // if we get here, all we know is that the proc exited
          log.log(`[actions-tester] runner stdout: ${chunk.toString('utf-8')}`);
          // exited with code 127 from signal SIGHUP
        });

        testerProcess.stderr?.setEncoding?.('utf-8');
        options.stdio[2] === 'pipe' && testerProcess.stderr.on('data', (/!** @type {Buffer} *!/ chunk) => {
          log.error(`[actions-tester] runner stderr: ${chunk.toString('utf-8')}`);
        });

        testerProcess.on('message', (message) => {
          log.log('[actions-tester] message:' + message);
        });

        testerProcess.on('error', (err) => {
          // This will be called with err being an AbortError if the controller aborts
          log.error('[actions-tester] runner error:' + err.toString());
          dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: err.message,
          });
        });

        testerProcess.on('disconnect', () => {
          log.warn('[actions-tester] runner disconnect');
        });

        testerProcess.on('close', (code, signal) => {
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

        testerProcess.on('exit', (code, signal) => {
          log.log(`[actions-tester] runner existed with code ${code} from signal ${signal}`);
        });

        log.log(`[actions-tester] runner spawned: ${testerProcess.pid}`);
      }, 1);
    } else {
      // TODO: send reasons about failed to compile
      log.error(`Failed to compile test runner with error ${signal}`);
    }
  });

  testerProcess.on('exit', (code, signal) => {
    log.log(`[actions-tester] compiler existed with code ${code} from signal ${signal}`);
  });

  log.log(`[actions-tester] compiler spawned: ${testerProcess.pid}`);
}
*/

/**
 * Normalize path to target location
 * @param {string} targetPath
 */
function normalizeTarget(targetPath) {
  return targetPath.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'));
}

/**
 * Generate test template project and execute action tester in background
 * @param {Object} options
 * @param {string} options.targetVersion
 * @param {string} options.codes
 * @param {string} options.capabilities
 * @param {string} [options.remoteAddress]
 * @returns {Promise<import('child_process').ChildProcess|import('teen_process').SubProcess|undefined>}
 */
async function runner(options) {
  log.log('Starting action tester with', options);
  let child;
  const {dest, copied} = await generator(options);
  // eslint-disable-next-line
  console.log('----0', dest, copied?.length ?? 0);

  if (!dest) {
    return;
  }

  const {targetVersion} = options;
  const {java: javaPath, javac: javacPath} = await resolveJavaExecutePaths();
  const compilerController = new ProcessAbortController();
  const { signal } = compilerController;
  const fileIndex = (new Date()).toFormattedString();
  /** @type {import('teen_process').SubProcessOptions} */
  const spawnOptions = {
    signal,
    // detached: true, ==> actionsTester.unref();
    detached: true,
    stdio: 'pipe',
    // stdio: ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')],
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

  const classPath = normalizeTarget(`libs/android-${targetVersion}-api-${ANDROID_VERSIONS[targetVersion]}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.2.3.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;`);
  // #1 compile java to class
  // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')]);
  // TODO: "teen_process::SubProcess"로 개선하자!
  child = spawn(javacPath, [
    // isDev ? '-verbose' : '',
    '-d',
    join(dest, 'out'),
    '--class-path',
    classPath,
    // '%CLASSPATH%',
    // TODO: Android or iOS
    join(dest, 'src', 'test', 'java', 'com', 'sptek', 'appium', 'AndroidUnitTest.java'),
  ], spawnOptions);

  child.on('exit', (code, signal) => {
    // if we get here, all we know is that the proc exited
    log.log(`exited with code ${code} from signal ${signal}`);
    // exited with code 127 from signal SIGHUP
    log.log(`[appium-tester] exited with code ${code} from signal ${signal}`);
  });

  child.on('stop', (code, signal) => {
    // if we get here, we know that we intentionally stopped the proc
    // by calling proc.stop
    log.log(`[appium-tester] stop with code ${code} from signal ${signal}`);
  });

  child.on('end', (code, signal) => {
    // if we get here, we know that the process stopped outside of our control
    // but with a 0 exit code
    log.log(`[appium-tester] ended with code ${code} from signal ${signal}`);
  });

  child.on('die', (code, signal) => {
    // if we get here, we know that the process stopped outside of our control
    // with a non-zero exit code
    log.log(`[appium-tester] died with code ${code} from signal ${signal}`);
  });

  child.on('output', (stdout, stderr) => {
    stdout && log.log(`[appium-tester] output::stdout: ${stdout}`);
    stderr && log.log(`[appium-tester] output::stderr: ${stderr}`);
  });

  // lines-stderr is just the same
  child.on('lines-stdout', (lines) => {
    log.log('[appium-tester] lines-stdout:', lines);
    // ['foo', 'bar', 'baz']
    // automatically handles rejoining lines across stream chunks
  });

  // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
  // prepended
  child.on('stream-line', (line) => {
    log.log('[appium-tester] stream-line:', line);
    // [STDOUT] foo
  });

  child.stdout?.setEncoding?.('utf-8');
  spawnOptions.stdio[1] === 'pipe' && child.stdout.on('data', (chunk) => {
    // if we get here, all we know is that the proc exited
    log.log('[actions-tester] compiler stdout:', chunk?.toString());
    // exited with code 127 from signal SIGHUP
  });

  child.stderr?.setEncoding?.('utf-8');
  spawnOptions.stdio[2] === 'pipe' && child.stderr.on('data', (chunk) => {
    log.error('[actions-tester] compiler stderr:', chunk?.toString());
  });

  child.on('message', (message) => {
    log.log('[actions-tester] compiler message:', message);
  });

  child.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[actions-tester] compiler error:', err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  child.on('disconnect', () => {
    log.warn('[actions-tester] compiler disconnect');
  });

  child.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[actions-tester] compiler closed with code ${code} from signal ${signal}`);
    if (code === 0 && signal === null) {
      log.log('Test runner compiled');
      // TODO: when compiling is done successfully, start running
      setTimeout(() => {
        child.unref();
        log.log('Starting test runner...');
        // #2 run class
        isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')]);
        const testerController = new ProcessAbortController();
        const { signal } = testerController;
        spawnOptions.signal = signal;
        // TODO: "teen_process::SubProcess"로 개선하자!
        child = spawn(javaPath, [
          // isDev ? '-verbose' : '',
          '-jar',
          normalizeTarget('libs/junit-platform-console-standalone-1.10.3.jar'),
          'execute',
          // '--class-path=%CLASSPATH%out',
          `--class-path=${classPath}${join(dest, 'out')};`,
          '--select-class=com.sptek.appium.AndroidUnitTest',
        ], spawnOptions);

        child.stdout?.setEncoding?.('utf-8');
        spawnOptions.stdio[1] === 'pipe' && child.stdout.on('data', (data) => {
          // if we get here, all we know is that the proc exited
          log.log(`[actions-tester] runner stdout: ${data}`);
          // exited with code 127 from signal SIGHUP
        });

        child.stderr?.setEncoding?.('utf-8');
        spawnOptions.stdio[2] === 'pipe' && child.stderr.on('data', (data) => {
          log.error(`[actions-tester] runner stderr: ${data}`);
        });

        child.on('message', (message) => {
          log.log('[actions-tester] message:' + message);
        });

        child.on('error', (err) => {
          // This will be called with err being an AbortError if the controller aborts
          log.error('[actions-tester] runner error:' + err.toString());
          dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: err.message,
          });
        });

        child.on('disconnect', () => {
          log.warn('[actions-tester] runner disconnect');
        });

        child.on('close', (code, signal) => {
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

        child.on('exit', (code, signal) => {
          log.log(`[actions-tester] runner existed with code ${code} from signal ${signal}`);
        });

        log.log(`[actions-tester] runner spawned: ${child.pid}`);
      }, 1);
    } else {
      // TODO: send reasons about failed to compile
      log.error('Failed to compile test runner with error');
    }
  });

  child.on('exit', (code, signal) => {
    log.log(`[actions-tester] compiler existed with code ${code} from signal ${signal}`);
  });

  log.log(`[actions-tester] compiler spawned: ${child.pid}`);

  return child;
}

export default runner;
