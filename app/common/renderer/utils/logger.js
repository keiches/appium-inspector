import electronLog from 'electron-log/renderer';

// if (import.meta.env.VITE_ELECTRON_LOG) {
if (process.env.ELECTRON_LOG) {
  Object.assign(console, electronLog.functions);
}

class Logger {
  constructor() {
    console.info('Log from the renderer process'); // eslint-disable-line no-console
  }

  debug(...args) {
    console.info(...args); // eslint-disable-line no-console
  }

  info(...args) {
    console.info(...args); // eslint-disable-line no-console
  }

  log(...args) {
    console.info(...args); // eslint-disable-line no-console
  }

  warn(...args) {
    console.warn(...args); // eslint-disable-line no-console
  }

  error(...args) {
    console.error(...args); // eslint-disable-line no-console
  }
}

export const log = new Logger();
