import {join} from 'path';

module.exports = {
  platformName: 'Android',
  maxInstances: 1,
  'appium:deviceName': 'Pixel_3_10.0',
  'appium:orientation': 'PORTRAIT',
  'appium:automationName': 'uiautomator2',
  'appium:app': join(process.cwd(), '../../apps/android.apk'),
  'appium:appWaitActivity': 'com.wdiodemoapp.MainActivity',
  'appium:newCommandTimeout': 240,
};
