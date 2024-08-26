// import {app} from 'electron';
// import fs from 'fs';
import * as path from 'path';
const {join, extname} = path;
// import {tmpdir} from 'os';
// import {realpathSync} from 'fs';
import {existsSync} from 'fs';
// import {randomUUID, randomBytes} from 'crypto';
// import {CaseConverterEnum, generateTemplateFiles} from 'generate-template-files';
// import replace from '@stdlib/string-replace';
import templateFile from 'template-file';
const {render} = templateFile;
import copy from 'recursive-copy';
// import copy from 'cpx2';
import through from 'through2';
import {ROOT_PATH, TEMP_PATH, TESTER_TEMP_PATH, TESTER_TEMPLATE_PATH, uuid} from '../utils.js';
// import temporaryDirectory from 'temp-dir';

// import {log} from '../logger';
// import {temporaryDirectory} from '../utils';

const log = console;

/*
export function copyTemplate(templateDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  fs.readdirSync(templateDir).forEach(file => {
    const srcFile = join(templateDir, file);
    const destFile = join(targetDir, file);

    if (fs.statSync(srcFile).isDirectory()) {
      copyTemplate(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

function getVarName(name, index) {
  return `${name}${index}`;
}

function parser(action) {
  // @site: https://velog.io/@dahunyoo/Locators-in-Appium
  // WebElement el = driver.findElement(AppiumBy.xpath("//!*[@class='android.widget.ImageView' and ./parent::*[@class='android.view.ViewGroup'] and (./preceding-sibling::* | ./following-sibling::*)[@text='Sauce Labs Backpack']]"));
  const codes = [];
  const id = `el_new_${Math.random()}`;
  if (action.strategy === 'xpath') { // id, xpath, accessibilityId
    codes.push(`WebElement el${id} = driver.findElement(AppiumBy.${action.strategy}("${action.params.locator}"))`);
    if (action.job === 'click') {
      codes.push(`el${id}.click();`);
    }
    switch (action.job) {
      case 'click':
        codes.push(`el${id}.click();`);
        break;
      case 'clear':
        codes.push(`el${id}.clear();`);
        break;
      case 'sendKeys':
        codes.push(`el${id}.sendKeys(${JSON.stringify(action.params.text)});`);
    }
  }
  return codes.join('\n');
}
*/

/*
function generator1(codes) {
  generateTemplateFiles([
    {
      option: 'Create Unit Test Main Class',
      // defaultCase: CaseConverterEnum.CamelCase, // '(pascalCase)',
      entry: {
        folderPath: './templates/src/test/java/com/sptek/appium/',
      },
      stringReplacers: [
        {slot: '__codes__', slotValue: codes},
      ],
      output: {
        path: join(tmpdir(), 'aav', 'test', 'UnitTest.java'), // /__store__(lowerCase)',
        // pathAndFileNameDefaultCase: '(kebabCase)',
        overwrite: true,
      },
      onComplete: (results) => {
        log.log(`results`, results);
      },
    },
  ]).then(() => {
    log.log('result');
  });
}
*/

/**
 * @param {string} codes
 * @return {Promise<boolean>}
 */
function generator1(codes) {
  // #0 create template directory
  const dest = join(TESTER_TEMP_PATH, uuid().replace(/-/g, ''));
  copy('./template', dest, {
    overwrite: true,
    expand: true,
    dot: true,
    filter: [
      'libs',
      'src',
      '*.cmd',
    ],
    /*rename(filePath) {
      return `${filePath}.orig`;
    },*/
    transform(src, dest, stats) {
      if (extname(src) === '.java') {
        return through(function (chunk, enc, done) {
          done(null, render(chunk.toString(), {
            codes,
            remoteAddress: 'http://localhost:4723', // 'host:port'
            capabilities: {
              app: 'C:\\Users\\keiches\\Projects\\sptek\\appium-app-validator\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk',
              appPackage: 'com.saucelabs.mydemoapp.rn',
              appActivity: '.MainActivity',
              deviceName: 'emulator-5554',
            },
          }));
        });
      }
      return null;
    },
  })
    .on(copy.events.COPY_FILE_START, (copyOperation) => {
      log.info('Copying file ' + copyOperation.src + '...');
    })
    .on(copy.events.COPY_FILE_COMPLETE, (copyOperation) => {
      log.info('Copied to ' + copyOperation.dest);
    })
    .on(copy.events.ERROR, (error, copyOperation) => {
      log.error('Unable to copy ' + copyOperation.dest);
    })
    .then((results) => {
      log.info(results.length + ' file(s) copied');
    })
    .catch((error) => {
      log.error('Copy failed: ' + error);
    });
  // #1 copy template files to target directory
  // #2 render main test class
  /*const renderFile('./templates/src/test/java/com/sptek/appium/UnitTest.java', {
    codes,
    remoteAddress: '', // 'host:port'
    capabilities: {
      app: '',
      appPackage: '',
      appActivity: '',
      deviceName: '',
    },
  });
  const fullPath = path.join(destination, path.basename(filename));
  fs.writeFile(fullPath, contents);
  return new Promise((resolve, reject) => {
    fs.readFile('./template/src/test/java/com/sptek/appium/UnitTest.java', 'utf8', (err, template) => {
      if (err) {
        // 파일을 읽는 중에 오류가 발생하면 `err` 인자로 에러 객체가 전달된다.
        log.error(err);
        reject(err);
        return;
      }
      // 파일 읽기에 성공하면 `data` 로 파일의 내용이 전달된다.
      log.log(template);
      // const result = replace(data, '__codes__', codes);
      renderFile(template, {
        codes,
        remoteAddress: '', // 'host:port'
        capabilities: {
          app: '',
          appPackage: '',
          appActivity: '',
          deviceName: '',
        },
      });
      //
      return !!result;
    });
  });*/
}

export const ANDROID_VERSIONS = {
  '9': '28',
  '10': '29',
  '11': '30',
  '12': '31',
  '12L': '32',
  '13': '33',
  '14': '34',
  '15': '35',
};

/**
 * @param {Object} options
 * @param {string} options.androidVersion
 * @param {string} options.codes
 * @param {string} options.remoteAddress
 * @param {string} options.capabilities
 * @return {Promise<{dest: String; copied: CopyOperation[]|void}>}
 */
async function generator({androidVersion, codes, remoteAddress, capabilities}) {
  // #0 create template directory
  const src = TESTER_TEMPLATE_PATH;
  const dest = join(TESTER_TEMP_PATH, uuid().replace(/-/g, ''));
  console.log('[generator] src =', src, existsSync(src));
  if (!existsSync(src)) {
    throw new Error();
  }
  console.log('[generator] dest =', dest, existsSync(dest));
  return await copy(TESTER_TEMPLATE_PATH, dest, {
    overwrite: true,
    expand: true,
    dot: true,
    filter: [
      '**/*',
      // '!libs/android-*.jar',
      '!**/libs/**/*',
      // 'src/**/*',
      '*.cmd',
    ],
    /*rename(filePath) {
      return `${filePath}.orig`;
    },*/
    transform(src, dest, stats) {
      switch (extname(src)) {
        case '.java':
          return through(function(chunk, enc, done) {
            done(null, render(chunk.toString(), {
              codes,
              remoteAddress: remoteAddress ?? 'http://localhost:4723', // 'host:port'
              capabilities: {
                app: 'C:\\Users\\keiches\\Projects\\sptek\\appium-app-validator\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk',
                appPackage: 'com.saucelabs.mydemoapp.rn',
                appActivity: '.MainActivity',
                deviceName: 'emulator-5554',
                ...capabilities,
              },
            }));
          });
        case '.cmd':
          return through(function(chunk, enc, done) {
            done(null, render(chunk.toString(), {
              android: {
                version: `-${androidVersion}-api-${ANDROID_VERSIONS[androidVersion]}`,
              },
            }));
          });
      }
      return null;
    },
  })
    .on(copy.events.COPY_FILE_START, (copyOperation) => {
      log.info('Copying file ' + copyOperation.src + '...');
    })
    .on(copy.events.COPY_FILE_COMPLETE, (copyOperation) => {
      log.info('Copied to ' + copyOperation.dest);
    })
    .on(copy.events.ERROR, (error, copyOperation) => {
      log.error('Unable to copy ' + copyOperation.dest);
    })
    .then((results) => {
      log.info(results.length + ' file(s) copied');
      return {
        dest,
        copied: results,
      };
    })
    .catch((error) => {
      log.error('Copy failed: ' + error);
    });
}

/*
generator({
  androidVersion: process.argv[2],
  codes: 'a = 1;',
  remoteAddress: 'http://localhost:4723', // 'host:port'
  capabilities: {
    app: 'C:\\Users\\keiches\\Projects\\sptek\\appium-app-validator\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk',
    appPackage: 'com.saucelabs.mydemoapp.rn',
    appActivity: '.MainActivity',
    deviceName: 'emulator-5554',
  },
}).then((r) => {
  // eslint-disable-next-line
  console.log('----0');
});
*/

export default generator;
