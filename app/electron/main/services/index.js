import {app, dialog, ipcMain} from 'electron';
import which from 'which';
import {createServer} from 'http';
// import express from 'express';
import {join, normalize, resolve} from 'path';
import {existsSync} from 'fs';
import {exec} from 'teen_process';

import {log} from '../logger';
import {getExecutableName, JRM_PATH, ROOT_PATH, exists} from '../utils';
import getPort from './get-port';
import serverRunner from './server/runner';
import testRunner from './test/runner';

import NodeDetector from './test/node-detector';
import JavaDetector from './test/java-detector';

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

export async function startAppiumServer() {
  return serverRunner();
}

/**
 * Start Tester process and message server
 * @param {Electron.BrowserWindow} window
 * @returns {import('http').Server<import('http').IncomingMessage, import('http').ServerResponse>}
 */
export function startTestServer(window) {
  let testerRunner;
  /** @type {import('http').Server<import('http').IncomingMessage, import('http').ServerResponse>} */
  let messageServer;

  const onAppQuit = () => {
    if (messageServer) {
      log.log('Terminate Message Server...');
      messageServer.close(() => {
        log.log('Message Server closed.');
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

  messageServer = createServer((/** @type {import('http').IncomingMessage} */ req, /** @type {import('http').ServerResponse} */ res) => {
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

  getPort({port: 8000})
    // eslint-disable-next-line promise/prefer-await-to-then
    .then((port) => {
      messageServer.listen(port, () => {
        log.log(`message server running on port #${port}`);
      });

      log.log(`message server on http://localhost:${port}/`);

      // Message Server가 실행되지 못했다면, Test Server도 실행할 수 없음
      ipcMain.on('start-test', async (event, ...args) => {
        // NOTE: args.length === 1이어야 함
        const {targetVersion, codes, capabilities, remoteAddress} = args[0];
        log.debug('[start-test]', '__', codes.substring(0, 10), '__', ...args);
        // TODO: "spawn({detached})"로 호출할 지 확인 후 결정
        testerRunner = testRunner({
          targetVersion,
          codes,
          capabilities: {
            ...capabilities,
            app: capabilities.app ? resolve(ROOT_PATH, '..', normalize(capabilities.app)) : undefined,
          },
          remoteAddress: remoteAddress ?? 'http://localhost:8000', // 'host:port'
        });
      });
    })
    // eslint-disable-next-line promise/prefer-await-to-then,promise/prefer-await-to-callbacks
    .catch((err) => {
      log.error('Failed to get available port:', err);
    });

  return messageServer;
}
