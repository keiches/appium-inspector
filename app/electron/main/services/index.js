import {app, dialog, ipcMain} from 'electron';
import {createServer} from 'http';
// import express from 'express';
import {join} from 'path';
import {log} from '../logger';
import {getExecutableName, JRM_PATH, ROOT_PATH, uuid} from '../utils';
import getPort from './get-port';
import testRunner from './test/runner';

import NodeDetector from './test/node-detector';
import JavaDetector from './test/java-detector';
import which from 'which';
import {exec} from 'teen_process';
import {existsSync} from 'fs';

/**
 * Return an executable path of cmd
 *
 * @param {string} cmd Standard output by command
 * @return {Promise<string|null>} The full path of cmd. `null` if the cmd is not found.
 */
export async function resolveExecutablePath(cmd) {
  let executablePath;
  try {
    executablePath = await which(cmd);
    if (executablePath && (await exists(executablePath))) {
      return executablePath;
    }
  } catch (err) {
    if (/not found/gi.test(err.message)) {
      log.debug(err);
    } else {
      log.warn(err);
    }
  }
  log.debug(`No executable path of '${cmd}'.`);
  if (executablePath) {
    log.debug(`Does '${executablePath}' exist?`);
  }
  return null;
}

/**
 * Get Node.Js executable path
 * @returns {Promise<string>}
 */
export async function resolveNodePath() {
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
export async function resolveJavaPath() {
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
export async function resolveJavaCompilerPath() {
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
 * Start Tester process and message server
 * @param window
 * @returns {import('http').Server<IncomingMessage, ServerResponse>}
 */
export function start(window) {
  let testerRunner;
  /** @type {import('http').Server<IncomingMessage, ServerResponse>} */
  let messageServer;

  const onAppQuit = () => {
    if (messageServer) {
      log.log('Terminate Message Server...');
      messageServer.close(() => {
        console.log('Message Server closed.');
        // process.exit(0);
      });
      messageServer = null;
    }

    if (testerRunner && !testerRunner.killed) {
      log.log('Terminate Tester process...');
      testerRunner.kill('SIGTERM');
      testerRunner = null;
    }
  };

  app.on('before-quit', onAppQuit).on('will-quit', onAppQuit);

  process.on('SIGINT', onAppQuit);
  process.on('SIGTERM', onAppQuit);

  messageServer = createServer((req, res) => {
    log.log('Requesting...:', req.url);
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
          console.log('Received message from Java: ', message);
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

  getPort({port: 8000}).then((port) => {
    messageServer.listen(port, () => {
      log.log(`message server running on port #${port}`);
    });

    log.log(`message server on http://localhost:${port}/`);
  });

  ipcMain.on('start-test', async (event, codes, ...args) => {
    log.debug('[start-test]', '__', codes, '__', ...args);

    // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
    // testerProcess = await runActionTester();
    testerRunner = testRunner({
      targetVersion: '12',
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
      capabilities: {
        deviceName: 'emulator-5554',
        app: join(ROOT_PATH, 'apps', 'Android-MyDemoAppRN.1.3.0.build-244.apk'),
        appPackage: 'com.saucelabs.mydemoapp.rn',
        appActivity: '.MainActivity',
      },
      remoteAddress: 'http://localhost:8000', // 'host:port'
    });
    /*
    await generator({
      codes,
      ...args,
      capabilities: {
        deviceName: 'emulator-5554',
        app: join(ROOT_PATH, 'apps', 'Android-MyDemoAppRN.1.3.0.build-244.apk'),
        appPackage: 'com.saucelabs.mydemoapp.rn',
        appActivity: '.MainActivity',
      },
      remoteAddress: 'http://localhost:4723', // 'host:port'
    });
    */
  });

  return messageServer;
}
