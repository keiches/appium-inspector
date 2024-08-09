/**
 * The '#local-polyfills' alias is defined in both Vite config files.
 * Since both files define different resolution paths,
 * they cannot be added to tsconfig and eslint configurations
 */

import {settings} from '#local-polyfills'; // eslint-disable-line import/no-unresolved
import {DEFAULT_SETTINGS} from '../shared/setting-defs';

export function getSetting(setting) {
  if (settings.has(setting)) {
    return settings.get(setting);
  }
  return DEFAULT_SETTINGS[setting];
}

export function setSetting(setting, value) {
  settings.set(setting, value);
}

export function getSettingSync(setting) {
  return settings.getSync(setting);
}

export {
  clipboard,
  shell,
  ipcRenderer,
  i18NextBackend,
  i18NextBackendOptions,
  fs,
  util,
} from '#local-polyfills'; // eslint-disable-line import/no-unresolved
