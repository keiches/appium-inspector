import {dialog} from 'electron';
// import {openSync} from 'fs';
import {join, normalize} from 'path';

// import {isDev} from '../../helpers';
import {log} from '../../logger';
import {JRM_PATH, TESTER_LIBS_PATH, TESTER_PATH, spawn, exists} from '../../utils';
import ANDROID_VERSIONS from './android-versions';
import generator from './generator';
import {resolveJavaExecutePaths} from '../index';
import {ProcessAbortController} from '../abort-controller.js';
import {isDev} from '../../helpers.js';

// const CLASS_PATH = 'libs/apiguardian-api-1.1.2.jar:libs/aspectjrt-1.9.22.1.jar:libs/aspectjtools-1.9.22.1.jar:libs/auto-service-annotations-1.1.1.jar:libs/byte-buddy-1.15.0.jar:libs/checker-qual-3.43.0.jar:libs/commons-codec-1.15.jar:libs/commons-exec-1.4.0.jar:libs/commons-logging-1.2.jar:libs/error_prone_annotations-2.28.0.jar:libs/failsafe-3.3.2.jar:libs/failureaccess-1.0.2.jar:libs/gson-2.11.0.jar:libs/guava-33.3.0-jre.jar:libs/httpasyncclient-4.1.5.jar:libs/httpclient-4.5.13.jar:libs/httpcore-4.4.13.jar:libs/httpcore-nio-4.4.13.jar:libs/httpmime-4.5.13.jar:libs/j2objc-annotations-3.0.0.jar:libs/java-client-9.3.0.jar:libs/jspecify-1.0.0.jar:libs/jsr305-3.0.2.jar:libs/jul-to-slf4j-2.0.16.jar:libs/junit-jupiter-5.11.0.jar:libs/junit-jupiter-api-5.11.0.jar:libs/junit-jupiter-engine-5.11.0.jar:libs/junit-jupiter-params-5.11.0.jar:libs/junit-platform-commons-1.11.0.jar:libs/junit-platform-engine-1.11.0.jar:libs/junit-platform-launcher-1.11.0.jar:libs/junit-platform-runner-1.11.0.jar:libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar:libs/log4j-over-slf4j-2.0.16.jar:libs/logback-classic-1.5.8.jar:libs/logback-core-1.5.8.jar:libs/opentelemetry-api-1.41.0.jar:libs/opentelemetry-api-incubator-1.41.0-alpha.jar:libs/opentelemetry-context-1.41.0.jar:libs/opentelemetry-exporter-logging-1.41.0.jar:libs/opentelemetry-sdk-1.41.0.jar:libs/opentelemetry-sdk-common-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-spi-1.41.0.jar:libs/opentelemetry-sdk-logs-1.41.0.jar:libs/opentelemetry-sdk-metrics-1.41.0.jar:libs/opentelemetry-sdk-trace-1.41.0.jar:libs/opentelemetry-semconv-1.25.0-alpha.jar:libs/opentest4j-1.3.0.jar:libs/selenium-api-4.24.0.jar:libs/selenium-chrome-driver-4.24.0.jar:libs/selenium-chromium-driver-4.24.0.jar:libs/selenium-devtools-v126-4.24.0.jar:libs/selenium-devtools-v127-4.24.0.jar:libs/selenium-devtools-v128-4.24.0.jar:libs/selenium-devtools-v85-4.24.0.jar:libs/selenium-edge-driver-4.24.0.jar:libs/selenium-firefox-driver-4.24.0.jar:libs/selenium-http-4.24.0.jar:libs/selenium-ie-driver-4.24.0.jar:libs/selenium-java-4.24.0.jar:libs/selenium-json-4.24.0.jar:libs/selenium-manager-4.24.0.jar:libs/selenium-os-4.24.0.jar:libs/selenium-remote-driver-4.24.0.jar:libs/selenium-safari-driver-4.24.0.jar:libs/selenium-support-4.24.0.jar:libs/slf4j-api-2.0.16.jar:libs/slf4j-simple-2.0.16.jar:libs/unirest-java-3.14.5-standalone.jar:libs/unirest-java-3.14.5.jar:libs/unirest-java-core-4.4.4.jar:libs/unirest-modules-jackson-4.4.4.jar:libs/unirest-objectmapper-jackson-4.2.9.jar'.replace(/:/g, ';');
const CLASS_PATH = 'libs/apiguardian-api-1.1.2.jar:libs/aspectjrt-1.9.22.1.jar:libs/aspectjtools-1.9.22.1.jar:libs/auto-service-annotations-1.1.1.jar:libs/byte-buddy-1.15.0.jar:libs/checker-qual-3.43.0.jar:libs/commons-codec-1.15.jar:libs/commons-exec-1.4.0.jar:libs/commons-logging-1.2.jar:libs/error_prone_annotations-2.28.0.jar:libs/failsafe-3.3.2.jar:libs/failureaccess-1.0.2.jar:libs/gson-2.11.0.jar:libs/guava-33.3.0-jre.jar:libs/httpasyncclient-4.1.5.jar:libs/httpclient-4.5.13.jar:libs/httpcore-4.4.13.jar:libs/httpcore-nio-4.4.13.jar:libs/httpmime-4.5.13.jar:libs/j2objc-annotations-3.0.0.jar:libs/java-client-9.3.0.jar:libs/jspecify-1.0.0.jar:libs/jsr305-3.0.2.jar:libs/jul-to-slf4j-2.0.16.jar:libs/junit-jupiter-5.11.0.jar:libs/junit-jupiter-api-5.11.0.jar:libs/junit-jupiter-engine-5.11.0.jar:libs/junit-jupiter-params-5.11.0.jar:libs/junit-platform-commons-1.11.0.jar:libs/junit-platform-engine-1.11.0.jar:libs/junit-platform-launcher-1.11.0.jar:libs/junit-platform-runner-1.11.0.jar:libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar:libs/log4j-over-slf4j-2.0.16.jar:libs/logback-classic-1.5.8.jar:libs/opentelemetry-api-1.41.0.jar:libs/opentelemetry-api-incubator-1.41.0-alpha.jar:libs/opentelemetry-context-1.41.0.jar:libs/opentelemetry-exporter-logging-1.41.0.jar:libs/opentelemetry-sdk-1.41.0.jar:libs/opentelemetry-sdk-common-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-spi-1.41.0.jar:libs/opentelemetry-sdk-logs-1.41.0.jar:libs/opentelemetry-sdk-metrics-1.41.0.jar:libs/opentelemetry-sdk-trace-1.41.0.jar:libs/opentelemetry-semconv-1.25.0-alpha.jar:libs/opentest4j-1.3.0.jar:libs/selenium-api-4.24.0.jar:libs/selenium-chrome-driver-4.24.0.jar:libs/selenium-chromium-driver-4.24.0.jar:libs/selenium-devtools-v126-4.24.0.jar:libs/selenium-devtools-v127-4.24.0.jar:libs/selenium-devtools-v128-4.24.0.jar:libs/selenium-devtools-v85-4.24.0.jar:libs/selenium-edge-driver-4.24.0.jar:libs/selenium-firefox-driver-4.24.0.jar:libs/selenium-http-4.24.0.jar:libs/selenium-ie-driver-4.24.0.jar:libs/selenium-java-4.24.0.jar:libs/selenium-json-4.24.0.jar:libs/selenium-manager-4.24.0.jar:libs/selenium-os-4.24.0.jar:libs/selenium-remote-driver-4.24.0.jar:libs/selenium-safari-driver-4.24.0.jar:libs/selenium-support-4.24.0.jar:libs/slf4j-api-2.0.16.jar:libs/unirest-java-3.14.5-standalone.jar:libs/unirest-java-3.14.5.jar:libs/unirest-java-core-4.4.4.jar:libs/unirest-modules-jackson-4.4.4.jar:libs/unirest-objectmapper-jackson-4.2.9.jar'.replace(/:/g, ';');

/**
 * Execute action tester in background
 * @returns {Promise<void>}
 */
/*
async function runActionTester() {
  log.log('Running action tester...', await resolveJavaPath());
  log.log(`----0>>> ${ROOT_PATH}`);
  log.log(`----1>>> ${await promises.realpath(ROOT_PATH)}`);
  // log.log(`----2>>> ${join(PACKAGES_PATH, 'tester-compile', `compile.${platform() === 'win32' ? 'cmd' : 'sh'}`)}`);

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
      ...process.env,
      // CLASSPATH: 'libs/android{{android.version}}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      // CLASSPATH: 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      // libs/junit-platform-launcher-1.10.3.jar:libs/aspectjrt-1.9.22.1.jar:libs/aspectjtools-1.9.22.1.jar:libs/java-client-9.3.0.jar:libs/selenium-api-4.21.0.jar:libs/selenium-remote-driver-4.21.0.jar:libs/auto-service-annotations-1.1.1.jar:libs/guava-33.2.0-jre.jar:libs/failureaccess-1.0.2.jar:libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar:libs/jsr305-3.0.2.jar:libs/checker-qual-3.42.0.jar:libs/j2objc-annotations-3.0.0.jar:libs/opentelemetry-semconv-1.25.0-alpha.jar:libs/opentelemetry-api-1.38.0.jar:libs/opentelemetry-context-1.38.0.jar:libs/opentelemetry-exporter-logging-1.38.0.jar:libs/opentelemetry-sdk-common-1.38.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar:libs/opentelemetry-api-incubator-1.38.0-alpha.jar:libs/opentelemetry-sdk-trace-1.38.0.jar:libs/opentelemetry-sdk-1.38.0.jar:libs/opentelemetry-sdk-metrics-1.38.0.jar:libs/opentelemetry-sdk-logs-1.38.0.jar:libs/byte-buddy-1.14.15.jar:libs/selenium-http-4.21.0.jar:libs/failsafe-3.3.2.jar:libs/selenium-json-4.21.0.jar:libs/selenium-manager-4.21.0.jar:libs/selenium-os-4.21.0.jar:libs/commons-exec-1.4.0.jar:libs/selenium-support-4.21.0.jar:libs/gson-2.11.0.jar:libs/error_prone_annotations-2.27.0.jar:libs/slf4j-api-2.0.16.jar:libs/slf4j-simple-2.0.16.jar:libs/junit-jupiter-5.10.3.jar:libs/junit-jupiter-api-5.10.3.jar:libs/opentest4j-1.3.0.jar:libs/junit-platform-commons-1.10.3.jar:libs/apiguardian-api-1.1.2.jar:libs/junit-jupiter-params-5.10.3.jar:libs/junit-jupiter-engine-5.10.3.jar:libs/junit-platform-engine-1.10.3.jar:libs/unirest-java-3.14.5-standalone.jar:libs/httpclient-4.5.13.jar:libs/httpcore-4.4.13.jar:libs/commons-logging-1.2.jar:libs/httpmime-4.5.13.jar:libs/httpcore-nio-4.4.13.jar:libs/httpasyncclient-4.1.5.jar:libs/commons-codec-1.15.jar:
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
    // 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/')),
    `${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}`,
    // `--class-path ${getClassPath()}`,
    // '%CLASSPATH%',
    join(dest, 'src/test/java/com/sptek/appium/AndroidUnitTest.java'),
  ], options);

  testerProcess.stdout?.setEncoding?.('utf-8');
  options.stdio[1] === 'pipe' && testerProcess.stdout.on('data', (/!** @type {Buffer} *!/ chunk) => {
    // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
    log.log(`[tester-compile] compiler stdout: ${chunk?.toString()}`);
  });

  testerProcess.stderr?.setEncoding?.('utf-8');
  options.stdio[2] === 'pipe' && testerProcess.stderr.on('data', (/!** @type {Buffer} *!/ chunk) => {
    /!*const content = Buffer.concat([chunk]).toString();
    console.log('--------', content);*!/
    log.error(`[tester-compile] compiler stderr: ${chunk?.toString()}`);
  });

  testerProcess.on('message', (message) => {
    log.log('[tester-compile] compiler message:' + message);
  });

  testerProcess.on('error', (err) => {
    // This will be called with err being an AbortError if the controller aborts
    log.error('[tester-compile] compiler error:' + err.toString());
    dialog.showMessageBox({
      type: 'error',
      buttons: ['OK'],
      message: err.message,
    });
  });

  testerProcess.on('disconnect', () => {
    log.warn('[tester-compile] compiler disconnect');
  });

  testerProcess.on('close', (code, signal) => {
    // if we get here, we know that the process stopped outside our control
    // but with a 0 exit code
    // app.quit();
    log.log(`[tester-compile] compiler closed with code ${code} from signal ${signal}`);
    if (signal === null) {
      log.log('Test runner compiled');
      // TODO: when compiling is done successfully, start running
      setTimeout(() => {
        testerProcess.unref();
        log.log('Starting test runner...');
        // #2 run class
        options.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')];
        /!*actionTester = spawn(join(__dirname, '..', 'libs', 'tester-compile', 'run'), [
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
          // `--class-path=${'libs/android.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          `--class-path=${`libs/android-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}.jar;`}${'libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;'.replace(/libs\//g, join(TESTER_LIBS_PATH, '/'))}${dest}\\out;`,
          '--select-class=com.sptek.appium.AndroidUnitTest',
        ], options);

        testerProcess.stdout?.setEncoding?.('utf-8');
        options.stdio[1] === 'pipe' && testerProcess.stdout.on('data', (/!** @type {Buffer} *!/ chunk) => {
          // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
          log.log(`[tester-compile] runner stdout: ${chunk.toString('utf-8')}`);
        });

        testerProcess.stderr?.setEncoding?.('utf-8');
        options.stdio[2] === 'pipe' && testerProcess.stderr.on('data', (/!** @type {Buffer} *!/ chunk) => {
          log.error(`[tester-compile] runner stderr: ${chunk.toString('utf-8')}`);
        });

        testerProcess.on('message', (message) => {
          log.log('[tester-compile] message:' + message);
        });

        testerProcess.on('error', (err) => {
          // This will be called with err being an AbortError if the controller aborts
          log.error('[tester-compile] runner error:' + err.toString());
          dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: err.message,
          });
        });

        testerProcess.on('disconnect', () => {
          log.warn('[tester-compile] runner disconnect');
        });

        testerProcess.on('close', (code, signal) => {
          // if we get here, we know that the process stopped outside our control
          // but with a 0 exit code
          // app.quit();
          log.log(`[tester-compile] runner closed with code ${code} from signal ${signal}`);
          if (code === 0 && signal === null) {
            // TODO: when compiling is done successfully, start running
            log.log('Test runner stopped');
          } else {
            // TODO: send reasons about failed to run
            log.error(`Failed to run test runner with code ${code} from signal ${signal}`);
          }
        });

        testerProcess.on('exit', (code, signal) => {
          log.log(`[tester-compile] runner existed with code ${code} from signal ${signal}`);
        });

        log.log(`[tester-compile] runner spawned: ${testerProcess.pid}`);
      }, 1);
    } else {
      // TODO: send reasons about failed to compile
      log.error(`Failed to compile test runner with error ${signal}`);
    }
  });

  testerProcess.on('exit', (code, signal) => {
    log.log(`[tester-compile] compiler existed with code ${code} from signal ${signal}`);
  });

  log.log(`[tester-compile] compiler spawned: ${testerProcess.pid}`);
}
*/

/**
 * Normalize path to target location
 * @param {string} targetPath
 */
function normalizeClassPath(targetPath) {
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
  log.log('[tester-compile] starting action tester with', options);
  let child;
  const {dest, copied} = await generator(options);
  // eslint-disable-next-line
  log.log('[tester-compile] template generated:', copied?.length ?? 0, 'files', 'to', dest);

  if (!dest) {
    return;
  }

  const {targetVersion} = options;
  const {java: javaPath, javac: javacPath} = await resolveJavaExecutePaths();
  const compilerController = new ProcessAbortController();
  const { signal } = compilerController;
  // const fileIndex = (new Date()).toFormattedString();
  /** @type {import('teen_process').SubProcessOptions} */
  const spawnOptions = {
    signal,
    // detached: true, ==> actionsTester.unref();
    // detached: false,
    // stdio: 'pipe',
    // stdio: ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')],
    // stdio: ['ignore', openSync('stdout_tester.txt', 'w'), openSync('stderr_tester.txt', 'w')],
    // stdio: ['pipe', 'ignore', 'inherit']
    // stdio: [Stdin, Stdout, Stderr];
    // shell: true,
    encoding: 'utf8',
    // cwd: 'C:\\Test\\Path',
    // cwd: dest,
    cwd: dest, // TESTER_PATH,
    // NOTE: 아래 값을 넣으면, 더 이상 shell 로 부터 환경설정값을 읽지 않게 됨
    env: {
      ...process.env,
      // CLASSPATH: 'libs/android{{android.version}}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      // CLASSPATH: 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      JAVA_HOME: JRM_PATH,
    }
  };

  // TODO: set Android or iOS
  // const sourcePath = join(dest, 'src', 'test', 'java', 'com', 'sptek', 'appium', 'AndroidUnitTest.java');
  const sourcePath = normalize(`./${join('src', 'test', 'java', 'com', 'sptek', 'appium', 'AndroidUnitTest.java')}`);
  // TODO: set actual class path
  // const classPath = normalizeTarget(`libs/android-${targetVersion}-api-${ANDROID_VERSIONS[targetVersion]}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.27.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;`);
  const classPath = `${process.env.ANDROID_HOME}/platforms/android-${ANDROID_VERSIONS[targetVersion]}/android.jar:${normalizeClassPath('libs/*')}`.replace(/:/g, ';');
  // #1 compile java to class
  // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')]);
  /*if (!(await exists(sourcePath))) {
    log.error(`[tester-compile] source ("${sourcePath}") not found`);
  } else {
    log.info(`[tester-compile] source ("${sourcePath}") found`);
  }*/
  child = spawn(javacPath, [
    isDev ? '-verbose' : '',
    '-d',
    'out', // join(dest, 'out'),
    '--class-path',
    classPath,
    // '%CLASSPATH%',
    sourcePath,
  ], spawnOptions);

  if (process.env.NODE_NATIVE) {
    child.stdout?.setEncoding?.('utf-8');
    /*spawnOptions.stdio?.[1] === 'pipe' &&*/
    child.stdout.on('data', (chunk) => {
      // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
      log.log('[tester-compile] compiler stdout:', chunk?.toString());
    });

    child.stderr?.setEncoding?.('utf-8');
    /*spawnOptions.stdio?.[2] === 'pipe' &&*/
    child.stderr.on('data', (chunk) => {
      log.error('[tester-compile] compiler stderr:', chunk?.toString());
    });

    child.on('message', (message) => {
      log.log('[tester-compile] compiler message:', message);
    });

    child.on('error', (err) => {
      // This will be called with err being an AbortError if the controller aborts
      log.error('[tester-compile] compiler error:', err.toString());
      dialog.showMessageBox({
        type: 'error',
        buttons: ['OK'],
        message: err.message,
      });
    });

    child.on('disconnect', () => {
      log.warn('[tester-compile] compiler disconnect');
    });

    child.on('close', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // but with a 0 exit code
      // app.quit();
      log.log(`[tester-compile] compiler closed with code ${code} from signal ${signal}`);
      if (code === 0 && signal === null) {
        log.log('[tester-compile] tester compiled');
        // TODO: when compiling is done successfully, start running
        setTimeout(() => {
          child?.unref?.();
          log.log('[test-runner] starting test runner...');
          // #2 run class
          // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')]);
          const testerController = new ProcessAbortController();
          const {signal} = testerController;
          spawnOptions.signal = signal;
          // TODO: "teen_process::SubProcess"로 개선하자!
          child = spawn(javaPath, [
            // '-XX:+PrintCommandLineFlags -XX:+PrintCompilation',
            // isDev ? '-verbose:class' : '',
            '-jar',
            normalizeClassPath('libs/junit-platform-console-standalone-1.11.0.jar'),
            'execute',
            // '--class-path=%CLASSPATH%out',
            // libs/android-12-api-31.jar:libs/apiguardian-api-1.1.2.jar:libs/aspectjrt-1.9.22.1.jar:libs/aspectjtools-1.9.22.1.jar:libs/auto-service-annotations-1.1.1.jar:libs/byte-buddy-1.15.0.jar:libs/checker-qual-3.43.0.jar:libs/commons-codec-1.15.jar:libs/commons-exec-1.4.0.jar:libs/commons-logging-1.2.jar:libs/error_prone_annotations-2.28.0.jar:libs/failsafe-3.3.2.jar:libs/failureaccess-1.0.2.jar:libs/gson-2.11.0.jar:libs/guava-33.3.0-jre.jar:libs/httpasyncclient-4.1.5.jar:libs/httpclient-4.5.13.jar:libs/httpcore-4.4.13.jar:libs/httpcore-nio-4.4.13.jar:libs/httpmime-4.5.13.jar:libs/j2objc-annotations-3.0.0.jar:libs/java-client-9.3.0.jar:libs/jspecify-1.0.0.jar:libs/jsr305-3.0.2.jar:libs/jul-to-slf4j-2.0.16.jar:libs/junit-jupiter-5.10.3.jar:libs/junit-jupiter-api-5.10.3.jar:libs/junit-jupiter-engine-5.10.3.jar:libs/junit-jupiter-params-5.10.3.jar:libs/junit-platform-commons-1.10.3.jar:libs/junit-platform-console-standalone-1.10.3.jar:libs/junit-platform-engine-1.10.3.jar:libs/junit-platform-launcher-1.10.3.jar:libs/junit-platform-runner-1.10.3.jar:libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar:libs/log4j-over-slf4j-2.0.16.jar:libs/logback-classic-1.5.8.jar:libs/logback-core-1.5.8.jar:libs/opentelemetry-api-1.41.0.jar:libs/opentelemetry-api-incubator-1.41.0-alpha.jar:libs/opentelemetry-context-1.41.0.jar:libs/opentelemetry-exporter-logging-1.41.0.jar:libs/opentelemetry-sdk-1.41.0.jar:libs/opentelemetry-sdk-common-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-1.41.0.jar:libs/opentelemetry-sdk-extension-autoconfigure-spi-1.41.0.jar:libs/opentelemetry-sdk-logs-1.41.0.jar:libs/opentelemetry-sdk-metrics-1.41.0.jar:libs/opentelemetry-sdk-trace-1.41.0.jar:libs/opentelemetry-semconv-1.25.0-alpha.jar:libs/opentest4j-1.3.0.jar:libs/selenium-api-4.24.0.jar:libs/selenium-chrome-driver-4.24.0.jar:libs/selenium-chromium-driver-4.24.0.jar:libs/selenium-devtools-v126-4.24.0.jar:libs/selenium-devtools-v127-4.24.0.jar:libs/selenium-devtools-v128-4.24.0.jar:libs/selenium-devtools-v85-4.24.0.jar:libs/selenium-edge-driver-4.24.0.jar:libs/selenium-firefox-driver-4.24.0.jar:libs/selenium-http-4.24.0.jar:libs/selenium-ie-driver-4.24.0.jar:libs/selenium-java-4.24.0.jar:libs/selenium-json-4.24.0.jar:libs/selenium-manager-4.24.0.jar:libs/selenium-os-4.24.0.jar:libs/selenium-remote-driver-4.24.0.jar:libs/selenium-safari-driver-4.24.0.jar:libs/selenium-support-4.24.0.jar:libs/slf4j-android-1.7.36.jar:libs/slf4j-api-2.0.16.jar:libs/slf4j-simple-2.0.16.jar:libs/unirest-java-3.14.5-standalone.jar:libs/unirest-java-3.14.5.jar:
            // `--class-path=${classPath}:target/test-classes:target/classes:out`,
            `--class-path=${process.env.ANDROID_HOME}/platforms/android-${ANDROID_VERSIONS[targetVersion]}/android.jar:${normalizeClassPath(CLASS_PATH)}:${normalize('target/test-classes:target/classes')}:out`.replace(/:/g, ';'),
            '--select-class=com.sptek.appium.AndroidUnitTest',
            // '--details=verbose',
            '--disable-banner',
            '--disable-ansi-colors',
          ], spawnOptions);

          child.stdout?.setEncoding?.('utf-8');
          /*spawnOptions.stdio?.[1] === 'pipe' &&*/
          child.stdout.on('data', (data) => {
            // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
            log.log(`[tester-compile] runner stdout: ${data}`);
          });

          child.stderr?.setEncoding?.('utf-8');
          /*spawnOptions.stdio?.[2] === 'pipe' &&*/
          child.stderr.on('data', (data) => {
            log.error(`[tester-compile] runner stderr: ${data}`);
          });

          child.on('message', (message) => {
            log.log('[tester-compile] message:' + message);
          });

          child.on('error', (err) => {
            // This will be called with err being an AbortError if the controller aborts
            log.error('[tester-compile] runner error:' + err.toString());
            dialog.showMessageBox({
              type: 'error',
              buttons: ['OK'],
              message: err.message,
            });
          });

          child.on('disconnect', () => {
            log.warn('[tester-compile] runner disconnect');
          });

          child.on('close', (code, signal) => {
            // if we get here, we know that the process stopped outside our control
            // but with a 0 exit code
            // app.quit();
            log.log(`[tester-compile] runner closed with code ${code} from signal ${signal}`);
            if (code === 0 && signal === null) {
              // TODO: when compiling is done successfully, start running
              log.log('[tester-compile] test runner stopped');
            } else {
              // TODO: send reasons about failed to run
              log.error(`[tester-compile] failed to run test runner with code ${code} from signal ${signal}`);
            }
          });

          child.on('exit', (code, signal) => {
            log.log(`[tester-compile] runner existed with code ${code} from signal ${signal}`);
          });

          log.log(`[tester-compile] runner spawned: ${child.pid}`);
        }, 1);
      } else {
        // TODO: send reasons about failed to compile
        log.error('[tester-compile] failed to compile test runner with error');
      }
    });

    child.on('exit', (code, signal) => {
      log.log(`[tester-compile] compiler existed with code ${code} from signal ${signal}`);
    });
  } else {
    child.on('exit', (code, signal) => {
      // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
      log.log(`[tester-compile] compiler exited with code ${code} from signal ${signal}`);
      // app.quit();
      if (code === 0 && signal === null) {
        log.log('[tester-compile] tester compiled');
        // TODO: when compiling is done successfully, start running
        setTimeout(async () => {
          child?.unref?.();
          log.log('[test-runner] starting test runner...');
          // #2 run class
          // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')]);
          const testerController = new ProcessAbortController();
          const {signal} = testerController;
          spawnOptions.signal = signal;
          // TODO: "teen_process::SubProcess"로 개선하자!
          child = spawn(javaPath, [
            // '-XX:+PrintCommandLineFlags -XX:+PrintCompilation',
            // isDev ? '-verbose:class' : '',
            '-jar',
            normalizeClassPath('libs/junit-platform-console-standalone-1.11.0.jar'),
            'execute',
            // '--class-path=%CLASSPATH%:out',
            // `--class-path=${classPath}:out`,
            // `--class-path=${classPath}:out`,
            `--class-path=${process.env.ANDROID_HOME}/platforms/android-${ANDROID_VERSIONS[targetVersion]}/android.jar:${normalizeClassPath(CLASS_PATH)}:${normalize('target/test-classes:target/classes')}:out`.replace(/:/g, ';'),
            '--select-class=com.sptek.appium.AndroidUnitTest',
            // '--details=verbose',
            '--disable-banner',
            '--disable-ansi-colors',
          ], spawnOptions);

          if (process.env.NODE_NATIVE) {
            child.stdout?.setEncoding?.('utf-8');
            /*spawnOptions.stdio?.[1] === 'pipe' &&*/
            child.stdout.on('data', (data) => {
              // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
              log.log(`[test-runner] runner stdout: ${data}`);
            });

            child.stderr?.setEncoding?.('utf-8');
            /*spawnOptions.stdio?.[2] === 'pipe' &&*/
            child.stderr.on('data', (data) => {
              log.error(`[test-runner] runner stderr: ${data}`);
            });

            child.on('message', (message) => {
              log.log('[test-runner] message:' + message);
            });

            child.on('error', (err) => {
              // This will be called with err being an AbortError if the controller aborts
              log.error('[test-runner] runner error:' + err.toString());
              dialog.showMessageBox({
                type: 'error',
                buttons: ['OK'],
                message: err.message,
              });
            });

            child.on('disconnect', () => {
              log.warn('[test-runner] runner disconnect');
            });

            child.on('close', (code, signal) => {
              // if we get here, we know that the process stopped outside our control
              // but with a 0 exit code
              // app.quit();
              log.log(`[test-runner] runner closed with code ${code} from signal ${signal}`);
              if (code === 0 && signal === null) {
                // TODO: when compiling is done successfully, start running
                log.log('[test-runner] test runner stopped');
              } else {
                // TODO: send reasons about failed to run
                log.error(`[test-runner] failed to run test runner with code ${code} from signal ${signal}`);
              }
            });

            child.on('exit', (code, signal) => {
              log.log(`[test-runner] runner existed with code ${code} from signal ${signal}`);
            });
          } else {
            child.on('exit', (code, signal) => {
              // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
              log.log(`[test-runner] exited with code ${code} from signal ${signal}`);
            });

            child.on('stop', (code, signal) => {
              // if we get here, we know that we intentionally stopped the proc
              // by calling proc.stop
              log.log(`[test-runner] stop with code ${code} from signal ${signal}`);
            });

            child.on('end', (code, signal) => {
              // if we get here, we know that the process stopped outside of our control
              // but with a 0 exit code
              log.log(`[test-runner] ended with code ${code} from signal ${signal}`);
            });

            child.on('die', (code, signal) => {
              // if we get here, we know that the process stopped outside of our control
              // with a non-zero exit code
              log.log(`[test-runner] died with code ${code} from signal ${signal}`);
            });

            child.on('output', (stdout, stderr) => {
              stdout && log.log(`[test-runner] output::stdout: ${stdout}`);
              stderr && log.log(`[test-runner] output::stderr: ${stderr}`);
            });

            child.on('lines-stdout', (lines) => {
              log.log('[test-runner] lines-stdout:', lines);
              // ['foo', 'bar', 'baz']
              // automatically handles rejoining lines across stream chunks
            });

            child.on('lines-stderr', (lines) => {
              log.log('[test-runner] lines-stderr:', lines);
              // ['foo', 'bar', 'baz']
              // automatically handles rejoining lines across stream chunks
            });

            // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
            // prepended
            child.on('stream-line', (line) => {
              line && log.log('[test-runner] stream-line:', line);
              // [STDOUT] foo
            });

            await child.start((stdout, stderr) => {
              if (/fail/.test(stderr)) {
                throw new Error('Encountered failure condition');
              }
              return stdout || stderr;
            });
          }

          log.log(`[tester-compile] runner spawned: ${child.pid}`);
        }, 1);
      } else {
        // TODO: send reasons about failed to compile
        log.error('[tester-compile] failed to compile test runner with error');
      }
    });

    child.on('stop', (code, signal) => {
      // if we get here, we know that we intentionally stopped the proc
      // by calling proc.stop
      log.log(`[tester-compile] stop with code ${code} from signal ${signal}`);
    });

    child.on('end', (code, signal) => {
      // if we get here, we know that the process stopped outside of our control
      // but with a 0 exit code
      log.log(`[tester-compile] ended with code ${code} from signal ${signal}`);
    });

    child.on('die', (code, signal) => {
      // if we get here, we know that the process stopped outside of our control
      // with a non-zero exit code
      log.log(`[tester-compile] died with code ${code} from signal ${signal}`);
    });

    child.on('output', (stdout, stderr) => {
      stdout && log.log(`[tester-compile] output::stdout: ${stdout}`);
      stderr && log.log(`[tester-compile] output::stderr: ${stderr}`);
    });

    child.on('lines-stdout', (lines) => {
      log.log('[tester-compile] lines-stdout:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    child.on('lines-stderr', (lines) => {
      log.log('[tester-compile] lines-stderr:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
    // prepended
    child.on('stream-line', (line) => {
      log.log('[tester-compile] stream-line:', line);
      // [STDOUT] foo
    });

    await child.start((stdout, stderr) => {
      if (/fail/.test(stderr)) {
        throw new Error('Encountered failure condition');
      }
      return stdout || stderr;
    });
  }

  log.log(`[tester-compile] compiler spawned: ${child.pid}`);

  return child;
}

export default runner;
