// import {dialog} from 'electron';
// import ADB from 'appium-adb';
// import ADB from '../services/adb';
import ADB from './adb';

// import {t} from '../helpers';
import {log} from '../logger';

export async function getDevices() {
  try {
    // TODO:
    const adb = await ADB.createADB();
    /*const adb = await ADB.createADB();

    const device = await adb.getPIDsByName('com.android.phone');

    log.log(`"com.android.phone": ${JSON.stringify(device)}`);*/

    /*await dialog.showMessageBox({
      type: 'info',
      buttons: [t('OK')],
      message: 'Devices retrieved',
    });*/
  } catch (err) {
    log.error(err);
  }
}
