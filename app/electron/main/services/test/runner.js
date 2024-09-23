import {dialog, ipcMain} from 'electron';
// import {EventEmitter} from 'events';
// import {openSync} from 'fs';
import getPort from 'get-port';
import {createServer} from 'http';
import {delimiter as pathDel, join, normalize, resolve, sep as pathSep} from 'path';

import {isDev} from '../../helpers.js';
import {log} from '../../logger';
import {isWindows, JRM_PATH, ROOT_PATH, spawn, TESTER_LIBS_PATH} from '../../utils';
import {resolveJavaExecutePaths} from '../index';
import ANDROID_VERSIONS from './android-versions';
import generator from './generator';

// const eventEmitter = new EventEmitter();

// NOTE: default target Windows (path delimater: ';', path separator: '\')
const CLASS_PATH = '@@java-client-9.3.0.jar;@@aspectjrt-1.9.22.1.jar;@@aspectjtools-1.9.22.1.jar;@@java-client-9.3.0.jar;@@selenium-support-4.24.0.jar;@@gson-2.11.0.jar;@@error_prone_annotations-2.27.0.jar;@@junit-jupiter-5.11.0.jar;@@junit-jupiter-api-5.11.0.jar;@@opentest4j-1.3.0.jar;@@junit-platform-commons-1.11.0.jar;@@apiguardian-api-1.1.2.jar;@@junit-jupiter-engine-5.11.0.jar;@@junit-platform-engine-1.11.0.jar;@@junit-jupiter-params-5.11.0.jar;@@selenium-api-4.24.0.jar;@@jspecify-1.0.0.jar;@@selenium-java-4.24.0.jar;@@selenium-chrome-driver-4.24.0.jar;@@selenium-chromium-driver-4.24.0.jar;@@selenium-devtools-v126-4.24.0.jar;@@selenium-devtools-v127-4.24.0.jar;@@selenium-devtools-v128-4.24.0.jar;@@selenium-devtools-v85-4.24.0.jar;@@selenium-edge-driver-4.24.0.jar;@@selenium-firefox-driver-4.24.0.jar;@@selenium-ie-driver-4.24.0.jar;@@selenium-safari-driver-4.24.0.jar;@@selenium-json-4.24.0.jar;@@selenium-remote-driver-4.24.0.jar;@@auto-service-annotations-1.1.1.jar;@@guava-33.3.0-jre.jar;@@failureaccess-1.0.2.jar;@@listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;@@jsr305-3.0.2.jar;@@checker-qual-3.43.0.jar;@@j2objc-annotations-3.0.0.jar;@@opentelemetry-semconv-1.25.0-alpha.jar;@@opentelemetry-api-1.41.0.jar;@@opentelemetry-context-1.41.0.jar;@@opentelemetry-exporter-logging-1.41.0.jar;@@opentelemetry-sdk-common-1.41.0.jar;@@opentelemetry-sdk-extension-autoconfigure-spi-1.41.0.jar;@@opentelemetry-sdk-extension-autoconfigure-1.41.0.jar;@@opentelemetry-api-incubator-1.41.0-alpha.jar;@@opentelemetry-sdk-trace-1.41.0.jar;@@opentelemetry-sdk-1.41.0.jar;@@opentelemetry-sdk-metrics-1.41.0.jar;@@opentelemetry-sdk-logs-1.41.0.jar;@@byte-buddy-1.15.0.jar;@@selenium-http-4.24.0.jar;@@failsafe-3.3.2.jar;@@selenium-manager-4.24.0.jar;@@selenium-os-4.24.0.jar;@@commons-exec-1.4.0.jar;@@unirest-java-3.14.5.jar;@@unirest-java-3.14.5-standalone.jar;@@unirest-java-core-4.4.4.jar;@@unirest-modules-jackson-4.4.4.jar;@@junit-platform-suite-1.11.0.jar;@@junit-platform-suite-api-1.11.0.jar;@@junit-platform-suite-engine-1.11.0.jar;@@junit-platform-suite-commons-1.11.0.jar;@@junit-platform-launcher-1.11.0.jar;@@slf4j-api-2.0.16.jar;@@logback-classic-1.5.8.jar;@@logback-core-1.5.8.jar;@@jul-to-slf4j-2.0.16.jar';

/**
 * Normalize path to target location
 * @param {string} targetPath
 */
function normalizeClassPath(targetPath) {
  return targetPath.replace(/@@/g, `${TESTER_LIBS_PATH}${pathSep}`);
}

function getCompileClassPath(targetVersion) {
  const classPath = `${TESTER_LIBS_PATH}${pathSep}*;${process.env.ANDROID_HOME}\\platforms\\android-${ANDROID_VERSIONS[targetVersion]}\\android.jar`;
  if (process.platform === 'win32') {
    return classPath;
  }
  return classPath.replace(/;/g, pathDel).replace(/\\/g, '/');
}

function getClassPath(targetVersion) {
  const classPath = `${normalizeClassPath(CLASS_PATH)};${process.env.ANDROID_HOME}\\platforms\\android-${ANDROID_VERSIONS[targetVersion]}\\android.jar;target\\test-classes;target\\classes;out`;
  if (process.platform === 'win32') {
    return classPath;
  }
  return classPath.replace(/;/g, pathDel).replace(/\\/g, '/');
}

let phase = 0;

/**
 * Generate test template project and execute action tester in background
 * @param {Object} options
 * @param {string} options.targetVersion
 * @param {string} options.codes
 * @param {string} options.capabilities
 * @param {string} [options.serverAddress]
 * @param {string} [options.testerAddress]
 * @param {Electron.BrowserWindow} window
 * @returns {Promise<import('child_process').ChildProcess|import('teen_process').SubProcess|undefined>}
 */
async function runTest(options, window) {
  log.log('[test-server] starting test runner with', options, '...');
  phase = 1;
  let child;
  const {dest, copied} = await generator(options);
  if (!dest) {
    log.error('[test-server] failed to generate template');
    return;
  }
  // eslint-disable-next-line
  log.debug('[test-server] template generated:', copied?.length ?? 0, 'files', 'to', dest);
  window.webContents.send('test-server', 'data', 'tester', 'start', {phase});

  phase = 2;
  const {targetVersion} = options;
  const {java: javaPath, javac: javacPath} = await resolveJavaExecutePaths();
  const compilerController = new AbortController();
  const {signal} = compilerController;
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
      // CLASSPATH: 'libs/android{{android.version}}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.28.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      // CLASSPATH: 'libs/android-12-api-31.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.28.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;',
      JAVA_HOME: JRM_PATH,
    }
  };

  // TODO: set Android or iOS
  // const sourcePath = join(dest, 'src', 'test', 'java', 'com', 'sptek', 'appium', 'AndroidUnitTest.java');
  const sourcePath = normalize(`./${join('src', 'test', 'java', 'com', 'sptek', 'appium', 'AndroidUnitTest.java')}`);
  // TODO: set actual class path
  // const classPath = normalizeTarget(`libs/android-${targetVersion}-api-${ANDROID_VERSIONS[targetVersion]}.jar;libs/junit-platform-launcher-1.10.3.jar;libs/aspectjrt-1.9.22.1.jar;libs/aspectjtools-1.9.22.1.jar;libs/java-client-9.3.0.jar;libs/selenium-api-4.21.0.jar;libs/selenium-remote-driver-4.21.0.jar;libs/auto-service-annotations-1.1.1.jar;libs/guava-33.2.0-jre.jar;libs/failureaccess-1.0.2.jar;libs/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar;libs/jsr305-3.0.2.jar;libs/checker-qual-3.42.0.jar;libs/j2objc-annotations-3.0.0.jar;libs/opentelemetry-semconv-1.25.0-alpha.jar;libs/opentelemetry-api-1.38.0.jar;libs/opentelemetry-context-1.38.0.jar;libs/opentelemetry-exporter-logging-1.38.0.jar;libs/opentelemetry-sdk-common-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-spi-1.38.0.jar;libs/opentelemetry-sdk-extension-autoconfigure-1.38.0.jar;libs/opentelemetry-api-incubator-1.38.0-alpha.jar;libs/opentelemetry-sdk-trace-1.38.0.jar;libs/opentelemetry-sdk-1.38.0.jar;libs/opentelemetry-sdk-metrics-1.38.0.jar;libs/opentelemetry-sdk-logs-1.38.0.jar;libs/byte-buddy-1.14.15.jar;libs/selenium-http-4.21.0.jar;libs/failsafe-3.3.2.jar;libs/selenium-json-4.21.0.jar;libs/selenium-manager-4.21.0.jar;libs/selenium-os-4.21.0.jar;libs/commons-exec-1.4.0.jar;libs/selenium-support-4.21.0.jar;libs/gson-2.11.0.jar;libs/error_prone_annotations-2.28.0.jar;libs/slf4j-api-2.0.16.jar;libs/slf4j-simple-2.0.16.jar;libs/junit-jupiter-5.10.3.jar;libs/junit-jupiter-api-5.10.3.jar;libs/opentest4j-1.3.0.jar;libs/junit-platform-commons-1.10.3.jar;libs/apiguardian-api-1.1.2.jar;libs/junit-jupiter-params-5.10.3.jar;libs/junit-jupiter-engine-5.10.3.jar;libs/junit-platform-engine-1.10.3.jar;libs/unirest-java-3.14.5-standalone.jar;libs/httpclient-4.5.13.jar;libs/httpcore-4.4.13.jar;libs/commons-logging-1.2.jar;libs/httpmime-4.5.13.jar;libs/httpcore-nio-4.4.13.jar;libs/httpasyncclient-4.1.5.jar;libs/commons-codec-1.15.jar;`);
  // const classPath = `${process.env.ANDROID_HOME}/platforms/android-${ANDROID_VERSIONS[targetVersion]}/android.jar:${normalizeClassPath('libs/*')}`.replace(/\.jar:/g, '.jar;');
  const classPath = getCompileClassPath(targetVersion);
  // #1 compile java to class
  // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_compile_${fileIndex}.txt`, 'w'), openSync(`stderr_compile_${fileIndex}.txt`, 'w')]);
  /*if (!(await exists(sourcePath))) {
    log.error(`[test-server:compile] source ("${sourcePath}") not found`);
  } else {
    log.info(`[test-server:compile] source ("${sourcePath}") found`);
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
      const message = chunk?.toString();
      // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
      log.log('[test-server] compiler stdout:', message);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'process',
        message: 'stdout data',
        data: {
          phase,
          message,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'data', {phase, message});
    });

    child.stderr?.setEncoding?.('utf-8');
    /*spawnOptions.stdio?.[2] === 'pipe' &&*/
    child.stderr.on('data', (chunk) => {
      const message = chunk?.toString();
      log.log('[test-server] compiler stderr:', message);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'message',
        message: 'stderr data',
        data: {
          phase,
          message,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'stderr data', {phase, message});
    });

    child.on('message', (message) => {
      log.log('[test-server] compiler message:', message);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'message',
        message,
        data: {
          phase,
          message,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'message', {phase, message});
    });

    child.on('error', (err) => {
      // This will be called with err being an AbortError if the controller aborts
      log.error('[test-server] compiler error:', err.toString());
      /*eventEmitter.emit('test-server', {
        type: 'error',
        name: 'process',
        message: err.message,
        data: {
          phase,
          error: err,
        },
      });*/
      window.webContents.send('test-server', 'error', 'compiler', 'data', {phase, error: err});
      dialog.showMessageBox({
        type: 'error',
        buttons: ['OK'],
        message: err.message,
      });
    });

    child.on('disconnect', () => {
      log.warn('[test-server] compiler disconnect');
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'process',
        message: 'disconnect',
        data: {
          phase,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'disconnect', {phase});
    });

    child.on('close', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // but with a 0 exit code
      // app.quit();
      log.log(`[test-server] compiler closed with code ${code} from signal ${signal}`);
      if (code === 0 && signal === null) {
        // TODO: when compiling is done successfully, start running
        window.webContents.send('test-server', 'data', 'compiler', 'close', {phase});
        setTimeout(() => {
          // child?.unref?.();
          phase = 3;
          log.log('[test-server] starting runner...');
          // #2 run class
          // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')]);
          const testerController = new AbortController();
          const {signal} = testerController;
          spawnOptions.signal = signal;
          // TODO: "teen_process::SubProcess"로 개선하자!
          child = spawn(javaPath, [
            // '-XX:+PrintCommandLineFlags',
            // '-XX:+PrintCompilation',
            '-XX:+UseG1GC -XX:MinHeapFreeRatio=30 -XX:MaxHeapFreeRatio=50 -XX:+UseStringDeduplication -ea -Didea.test.cyclic.buffer.size=1048576 -Dfile.encoding=UTF-8 -Dsun.stdout.encoding=UTF-8 -Dsun.stderr.encoding=UTF-8',
            // isDev ? '-verbose:class' : '',
            '-jar',
            normalizeClassPath('@@junit-platform-console-standalone-1.11.0.jar'),
            'execute',
            // TODO: 시작 위치를 lib으로 해서 전체 길이를 줄여보자. (cwd: TEST_ROOT)
            `--class-path=${getClassPath(targetVersion)}`,
            '--select-class=com.sptek.appium.AndroidUnitTest',
            // '--details=verbose',
            '--disable-banner',
            '--disable-ansi-colors',
          ], spawnOptions);

          child.stdout?.setEncoding?.('utf-8');
          /*spawnOptions.stdio?.[1] === 'pipe' &&*/
          child.stdout.on('data', (chunk) => {
            const message = chunk?.toString();
            // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
            log.log('[test-server] runner stdout:', message);
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'stdout data',
              data: {
                phase,
                message,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'stdout data', {phase, message});
          });

          child.stderr?.setEncoding?.('utf-8');
          /*spawnOptions.stdio?.[2] === 'pipe' &&*/
          child.stderr.on('data', (chunk) => {
            const message = chunk?.toString();
            log.error('[test-server] runner stderr:', message);
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'stderr data',
              data: {
                phase,
                message,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'stderr data', {phase, message});
          });

          child.on('message', (message) => {
            log.log('[test-server] runner message:', message);
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'message',
              data: {
                phase,
                message,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'message', {phase, message});
          });

          child.on('error', (err) => {
            // This will be called with err being an AbortError if the controller aborts
            log.error('[test-server] runner error:', err.toString());
            /*eventEmitter.emit('test-server', {
              type: 'error',
              name: 'process',
              message: err.message,
              data: {
                phase,
                error: err,
              },
            });*/
            window.webContents.send('test-server', 'error', 'tester', err.message, {phase, error: err});
            dialog.showMessageBox({
              type: 'error',
              buttons: ['OK'],
              message: err.message,
            });
          });

          child.on('disconnect', () => {
            log.warn('[test-server] runner disconnect');
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'disconnect',
              data: {
                phase,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'disconnect', {phase});
          });

          child.on('close', (code, signal) => {
            // if we get here, we know that the process stopped outside our control
            // but with a 0 exit code
            // app.quit();
            log.log(`[test-server] runner closed with code ${code} from signal ${signal}`);
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'close',
              data: {
                phase,
                code,
                signal,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'close', {phase, code, signal});
          });

          child.on('exit', (code, signal) => {
            log.log(`[test-server] runner existed with code ${code} from signal ${signal}`);
            /*eventEmitter.emit('test-server', {
              type: 'data',
              name: 'process',
              message: 'exit',
              data: {
                phase,
                code,
                signal,
              },
            });*/
            window.webContents.send('test-server', 'data', 'tester', 'exit', {phase, code, signal});
          });

          log.log('[test-server] runner spawned:', child.pid);
        }, 1);
      } else {
        // TODO: send reasons about failed to compile
        log.error('[test-server] failed to run test runner');
        /*eventEmitter.emit('test-server', {
          type: 'error',
          name: 'process',
          message: 'failed to test',
          data: {
            phase,
          },
        });*/
        window.webContents.send('test-server', 'error', 'compiler', 'close', {phase, code, signal});
      }
    });

    child.on('exit', (code, signal) => {
      log.log(`[test-server] compiler existed with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('test-server', {
        type: 'error',
        name: 'process',
        message: 'exit',
        data: {
          phase,
          code,
          signal,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'exit', {phase, code, signal});
      if (code === 0 && signal === null) {
        log.error('[test-server] failed to compile test template');
      }
    });
  } else {
    child.on('exit', (code, signal) => {
      // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
      log.log(`[test-server] compiler exited with code ${code} from signal ${signal}`);
      // app.quit();
      if (code === 0 && signal === null) {
        log.log('[test-server] test template compiled');
        // TODO: when compiling is done successfully, start running
        setTimeout(async () => {
          // child?.unref?.();
          log.log('[test-server] starting runner...');
          // #2 run class
          // isDev && (spawnOptions.stdio = ['ignore', openSync(`stdout_test_${fileIndex}.txt`, 'w'), openSync(`stderr_test_${fileIndex}.txt`, 'w')]);
          const testerController = new AbortController();
          const {signal} = testerController;
          spawnOptions.signal = signal;
          // TODO: "teen_process::SubProcess"로 개선하자!
          child = spawn(javaPath, [
            // '-XX:+PrintCommandLineFlags -XX:+PrintCompilation',
            // isDev ? '-verbose:class' : '',
            '-jar',
            normalizeClassPath('@@junit-platform-console-standalone-1.11.0.jar'),
            'execute',
            `--class-path=${getClassPath(targetVersion)}`,
            '--select-class=com.sptek.appium.AndroidUnitTest',
            // '--details=verbose',
            '--disable-banner',
            '--disable-ansi-colors',
          ], spawnOptions);

          if (process.env.NODE_NATIVE) {
            child.stdout?.setEncoding?.('utf-8');
            /*spawnOptions.stdio?.[1] === 'pipe' &&*/
            child.stdout.on('data', (chunk) => {
              const message = chunk?.toString();
              // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
              log.log('[test-server] runner stdout:', message);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'stdout data',
                data: {
                  phase,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'stdout data', {phase, message});
            });

            child.stderr?.setEncoding?.('utf-8');
            /*spawnOptions.stdio?.[2] === 'pipe' &&*/
            child.stderr.on('data', (chunk) => {
            const message = chunk?.toString();
              log.log('[test-server] runner stderr:', message);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'stderr data',
                data: {
                  phase,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'stderr data', {phase, message});
            });

            child.on('message', (message) => {
              log.log('[test-server] message:', message);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message,
                data: {
                  phase,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'message', {phase, message});
            });

            child.on('error', (err) => {
              // This will be called with err being an AbortError if the controller aborts
              log.error('[test-server] runner error:', err.toString());
              window.webContents.send('test-server', 'error', 'tester', err.toString(), {phase, error: err});
              dialog.showMessageBox({
                type: 'error',
                buttons: ['OK'],
                message: err.message,
              });
            });

            child.on('disconnect', () => {
              log.warn('[test-server] runner disconnect');
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'disconnect',
                data: {
                  phase,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'disconnect', {phase});
            });

            child.on('close', (code, signal) => {
              // if we get here, we know that the process stopped outside our control
              // but with a 0 exit code
              // app.quit();
              log.log(`[test-server] runner closed with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'close',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'close', {phase, code, signal});
              if (code === 0 && signal === null) {
                // TODO: when compiling is done successfully, start running
                log.log('[test-server] runner stopped');
              }
            });

            child.on('exit', (code, signal) => {
              log.log(`[test-server] runner existed with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'exit',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'exit', {phase, code, signal});
            });
          } else {
            child.on('exit', (code, signal) => {
              // if we get here, all we know is that the proc exited with code 127 from signal SIGHUP
              log.log(`[test-server] runner exited with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'exit',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'exit', {phase, code, signal});
            });

            child.on('stop', (code, signal) => {
              // if we get here, we know that we intentionally stopped the proc
              // by calling proc.stop
              log.log(`[test-server] runner stop with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'stop',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'stop', {phase, code, signal});
            });

            child.on('end', (code, signal) => {
              // if we get here, we know that the process stopped outside of our control
              // but with a 0 exit code
              log.log(`[test-server] runner ended with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'end',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'end', {phase, code, signal});
            });

            child.on('die', (code, signal) => {
              // if we get here, we know that the process stopped outside our control
              // with a non-zero exit code
              log.log(`[test-server] runner died with code ${code} from signal ${signal}`);
              /*eventEmitter.emit('test-server', {
                type: 'data',
                name: 'process',
                message: 'die',
                data: {
                  phase,
                  code,
                  signal,
                },
              });*/
              window.webContents.send('test-server', 'data', 'tester', 'die', {phase, code, signal});
            });

            child.on('output', (stdout, stderr) => {
              stdout && log.log(`[test-server] runner output::stdout: ${stdout}`);
              stderr && log.log(`[test-server] runner output::stderr: ${stderr}`);
              if (stdout || stderr) {
                /*eventEmitter.emit('test-server', {
                  type: 'data',
                  name: 'process',
                  message: 'output',
                  data: {
                    phase,
                    message: stdout ?? stderr,
                  },
                });*/
                window.webContents.send('test-server', 'data', 'tester', 'output', {phase, message: stdout ?? stderr});
              }
            });

            /*child.on('lines-stdout', (lines) => {
              lines.length && log.log('[test-server] runner lines-stdout:', lines);
              // ['foo', 'bar', 'baz']
              // automatically handles rejoining lines across stream chunks
            });

            child.on('lines-stderr', (lines) => {
              lines.length && log.log('[test-server] runner lines-stderr:', lines);
              // ['foo', 'bar', 'baz']
              // automatically handles rejoining lines across stream chunks
            });

            // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
            // prepended
            child.on('stream-line', (line) => {
              line && log.log('[test-server] runner stream-line:', line);
              // [STDOUT] foo
            });*/

            await child.start((stdout, stderr) => {
              if (/fail/.test(stderr)) {
                // throw new Error('Encountered failure condition');
                log.error('[test-server] runner encountered failure condition:', stderr);
                /*eventEmitter.emit('test-server', {
                  type: 'error',
                  name: 'server',
                  message: stderr,
                  data: {
                    phase,
                  },
                });*/
                window.webContents.send('test-server', 'error', 'tester', 'start', {phase, message: stderr});
              } else {
                /*eventEmitter.emit('test-server', {
                  type: 'data',
                  name: 'server',
                  message: start,
                  data: {
                    phase,
                  },
                });*/
                window.webContents.send('test-server', 'data', 'tester', 'start', {phase, message: stdout});
              }
              return stdout || stderr;
            });
          }

          log.log('[test-server] runner spawned:', child.pid);
        }, 1);
      } else {
        log.error('[test-server] failed to compile test template');
        /*eventEmitter.emit('test-server', {
          type: 'error',
          name: 'process',
          message: 'exit',
          data: {
            phase,
            code,
            signal,
          },
        });*/
        window.webContents.send('test-server', 'error', 'compiler', 'exit', {phase, code, signal});
      }
    });

    child.on('stop', (code, signal) => {
      // if we get here, we know that we intentionally stopped the proc
      // by calling proc.stop
      log.log(`[test-server] compiler stop with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'server',
        message: 'stop',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'stop', {phase, code, signal});
    });

    child.on('end', (code, signal) => {
      // if we get here, we know that the process stopped outside our control
      // but with a 0 exit code
      log.log(`[test-server] compiler ended with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'server',
        message: 'end',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'end', {phase, code, signal});
    });

    child.on('die', (code, signal) => {
      // if we get here, we know that the process stopped outside of our control
      // with a non-zero exit code
      log.log(`[test-server] compiler died with code ${code} from signal ${signal}`);
      /*eventEmitter.emit('test-server', {
        type: 'data',
        name: 'server',
        message: 'die',
        data: {
          code,
          signal,
        },
      });*/
      window.webContents.send('test-server', 'data', 'compiler', 'die', {phase, code, signal});
    });

    child.on('output', (stdout, stderr) => {
      stdout && log.log(`[test-server] compiler output::stdout: ${stdout}`);
      stderr && log.log(`[test-server] compiler output::stderr: ${stderr}`);
      if (stdout || stderr) {
        /*eventEmitter.emit('test-server', {
          type: 'data',
          name: 'server',
          message: 'end',
          data: {
            message: stdout ?? stderr,
          },
        });*/
        window.webContents.send('test-server', 'data', 'compiler', 'output', {phase, message: stdout ?? stderr});
      }
    });

    /*child.on('lines-stdout', (lines) => {
      lines.length && log.log('[test-server] compiler lines-stdout:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    child.on('lines-stderr', (lines) => {
      lines.length && log.log('[test-server] compiler lines-stderr:', lines);
      // ['foo', 'bar', 'baz']
      // automatically handles rejoining lines across stream chunks
    });

    // stream-line gives you one line at a time, with [STDOUT] or [STDERR]
    // prepended
    child.on('stream-line', (line) => {
      log.log('[test-server] compiler stream-line:', line);
      // [STDOUT] foo
    });*/

    await child.start((stdout, stderr) => {
      if (/fail/.test(stderr)) {
        // throw new Error(`Encountered failure condition: ${stderr}`);
        log.error('[test-server] compiler encountered failure condition:', stderr);
        /*eventEmitter.emit('test-server', {
          type: 'error',
          name: 'process',
          message: stderr,
          data: {
            phase,
          },
        });*/
        window.webContents.send('test-server', 'error', 'compiler', 'start', {phase, message: stderr});
      } else {
        /*eventEmitter.emit('test-server', {
          type: 'data',
          name: 'process',
          message: stdout,
          data: {
            phase,
          },
        });*/
        window.webContents.send('test-server', 'data', 'compiler', 'start', {phase, message: stdout});
      }
      return stdout || stderr;
    });
  }

  log.log('[test-server] compiler spawned:', child.pid);

  return child;
}

function resolveAppPath(appPath) {
  const targetPath = resolve(ROOT_PATH, '..', normalize(appPath));
  if (isWindows) {
    return targetPath.replace(/\\/g, '\\\\');
  }

  return targetPath;
}

/**
 * Execute Appium server in background
 * @param {Electron.BrowserWindow} window
 * @returns {Promise<import('http').Server<import('http').IncomingMessage, import('http').ServerResponse<import('http').IncomingMessage>>>}
 */
async function runner(window) {
  log.log('[test-server] starting server...');
  let child;
  /** @type {import('http').Server<import('http').IncomingMessage, import('http').ServerResponse<import('http').IncomingMessage>>} */
  let messageServer;

  const handleKillProcess = () => {
    if (!child) {
      return;
    }
    log.log('[test-server] terminate message server...');
    if (process.env.NODE_NATIVE) {
      if (!child.killed) {
        child.kill?.('SIGTERM'); // NodeJS.Signals
        // process.kill(testerRunner.pid, 'SIGINT');
        child = null;
      }
    } else {
      if (child.isRunning) {
        child.stop?.('SIGTERM'); // NodeJS.Signals
        child = null;
      }
    }
    /*eventEmitter.emit('test-server', {
      type: 'data',
      name: 'server',
      message: 'killed',
      data: {
        phase,
      },
    });*/
    // window.webContents.send('test-server', 'data', 'server', 'process killed', {phase});
  };
  /*
  // NOTE: main.js에서 처리함
  const onAppQuit = () => {
    if (messageServer) {
      log.log('Terminate Message Server...');
      messageServer.closeAllConnections();
      messageServer = null;
    }
    if (process.env.NODE_NATIVE) {
      if (testRunner && !testRunner.killed) {
        log.log('Terminate Test runner...');
        testRunner.kill?.('SIGTERM'); // NodeJS.Signals
        // process.kill(testerRunner.pid, 'SIGINT');
        testRunner = null;
      }
    } else {
      if (testRunner && testRunner.isRunning) {
        log.log('Terminate Test runner...');
        testRunner.stop?.('SIGTERM'); // NodeJS.Signals
        testRunner = null;
      }
    }
  };

  app.on('before-quit', onAppQuit).on('will-quit', onAppQuit);

  process.on('SIGINT', onAppQuit);
  process.on('SIGTERM', onAppQuit);
  */

  messageServer = createServer();

  /*const server2 = express();
  server2.get('/', (req, res) => {
    return res.send('메인 페이지');
  });

  server2.get('/', (req, res) => {
    return res.send('로그인 페이지');
  });

  server2.listen(8080, () => {
    log.log('express server running on port 8080');
  });*/

  // server 객체에 이벤트를 연결합니다.
  messageServer.on('request', (/** @type {import('http').IncomingMessage} */ req, /** @type {import('http').ServerResponse} */ res) => {
    log.log('[test-server] requesting...:', req.url);
    /*eventEmitter.emit('test-server', {
      type: 'data',
      name: 'server',
      message: 'request',
      data: {
        url: req.url,
      },
    });*/
    window.webContents.send('test-server', 'data', 'server', 'request', {phase, url: req.url});
    /* NOTE: 별도의 uuid로 session 별로 구분하는 것이 안전할 듯...
    const port = uuid();
    ipcMain.once(port, (ev, status, head, body) => {
      res.writeHead(status, head);
      res.end(body);
    });
    window.webContents.send('uuid-for-this-time', req, port);
     */
    /*
    const remoteAddress = res.socket.remoteAddress;
    const remotePort = res.socket.remotePort;
    */
    if (req.method === 'POST') {
      if (req.url === '/message') {
        const body = [];
        req.on('data', (chunk) => {
          body.push(chunk.toString());
        });
        req.on('end', () => {
          // console.log('Received message from Java:', body);
          const message = Buffer.concat(body).toString();
          log.log('Received message from Java: ', message);
          // window.webContents.send('message-from-java', body);
          // Java 프로세스에 응답 보내기
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Message received');
        });
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } else {
      res.end('Hello from Electron!');
    }
  });

  messageServer.on('connection', () => {
    log.log('[test-server] connection on');
    /*eventEmitter.emit('test-server', {
      type: 'data',
      name: 'server',
      message: 'connection',
      data: {
        phase,
      },
    });*/
    window.webContents.send('test-server', 'data', 'server', 'connection', {phase});
  });

  messageServer.on('close', () => {
    log.log('[test-server] close');
    handleKillProcess();
    window.webContents.send('test-server', 'data', 'server', 'close', {phase});
  });

  return await getPort({port: 8000})
    // eslint-disable-next-line promise/prefer-await-to-then
    .then((port) => {
      messageServer.listen(port, () => {
        log.log(`[test-server] message server running on port #${port}`);
        /*eventEmitter.emit('test-server', {
          type: 'data',
          name: 'server',
          message: 'start',
          data: {
            phase,
          },
        });*/
        window.webContents.send('test-server', 'data', 'server', 'start', {phase});
      });

      log.log(`[test-server] message server on http://127.0.0.1:${port}/`);

      // TODO: Message Server가 실행되지 못했다면, Test Server도 실행할 수 없음
      ipcMain.on('start-test', async (event, ...args) => {
        // NOTE: args.length === 1이어야 함
        const {targetVersion, codes, capabilities, serverAddress, testerAddress, ...rest} = args[0];
        log.debug('[start-test]', '__', codes.substring(0, 10), '__', ...args);
        // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
        child = runTest({
          targetVersion,
          codes,
          capabilities: {
            ...capabilities,
            app: capabilities.app ? resolveAppPath(capabilities.app) : undefined,
          },
          serverAddress: serverAddress ?? 'http://localhost:4723', // 'host:port'
          testerAddress: testerAddress ?? 'http://localhost:8000', // 'host:port',
          ...rest,
        }, window);
        ipcMain.once('stop-test', () => {
          log.debug('[stop-test]......');
          handleKillProcess();
          window.webContents.send('test-server', 'data', 'server', 'stop-test', {phase});
        });
      });

      return messageServer;
    })
    // eslint-disable-next-line promise/prefer-await-to-then,promise/prefer-await-to-callbacks
    .catch((err) => {
      log.error('[test-server] failed to get available port:', err);
      /*eventEmitter.emit('test-server', {
        type: 'error',
        name: 'server',
        message: err.message,
      });*/
      window.webContents.send('test-server', 'error', 'server', err.message, {phase, error: err});
    });
}

export default runner;
