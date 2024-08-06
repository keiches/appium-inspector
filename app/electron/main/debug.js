import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-extension-installer';
import {log} from './logger';

export async function installExtensions() {
  const opts = {
    forceDownload: !!process.env.UPGRADE_EXTENSIONS,
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  };
  try {
    await installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS], opts);
  } catch (e) {
    log.warn(`Error installing extension: ${e}`); // eslint-disable-line no-console
  }
}
