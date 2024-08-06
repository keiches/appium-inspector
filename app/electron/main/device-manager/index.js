// import ADB from 'appium-adb';
import {dialog} from 'electron';
import {t} from '../helpers';
import {log} from '../logger';

export async function getDevices() {
  try {
    /*const adb = await ADB.createADB();

    const device = await adb.getPIDsByName('com.android.phone');

    log.log(`"com.android.phone": ${JSON.stringify(device)}`);*/

    await dialog.showMessageBox({
      type: 'info',
      buttons: [t('OK')],
      message: 'Devices retrieved',
    });
  } catch (err) {
    log.error(err);
  }
}
