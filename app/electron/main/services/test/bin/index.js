import fs from 'fs';
import {join, resolve} from 'path';
import generator from '../generator.js';
import {ROOT_PATH} from '../../../utils.js';
// import commandLineArgs from 'command-line-args';

/*
console.log('@@1-1@', process.argv);
console.log('@@1-2@', JSON.stringify(import.meta));

if (import.meta.url) {
  console.log('required as a module');
} else {
  console.log('called directly');
}
*/

if (process.argv.length === 2) {
  // eslint-disable-next-line
  console.error('Expected at least one argument!');
  process.exit(1);
}

/*const optionDefinitions = [
  { name: 'android-version', alias: 'AV', type: Boolean },
  // { name: 'src', alias: 'S', type: String, multiple: true, defaultOption: true },
  { name: 'src', alias: 'S', type: String, defaultOption: true },
  { name: 'remote-address', alias: 'RA', type: Number }
];*/

try {
  // const options = commandLineArgs(optionDefinitions);

  // const src = fs.readFileSync('input.txt', 'utf8');

  await generator({
    androidVersion: process.argv[2],
    codes: 'a = 2;',
    capabilities: {
      deviceName: 'emulator-5554',
      app: resolve(ROOT_PATH, '..', 'apps', 'Android-MyDemoAppRN.1.3.0.build-244.apk'),
      appPackage: 'com.saucelabs.mydemoapp.rn',
      appActivity: '.MainActivity',
    },
    remoteAddress: 'http://localhost:4723', // 'host:port'
  });
  // eslint-disable-next-line
  console.log('----1');
} catch (err) {
  // eslint-disable-next-line
  console.error(err);
}
