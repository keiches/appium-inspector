/*import electronLog from 'electron-log/main';

if (process.env.ELECTRON_LOG) {
  // Optional, initialize the logger for any renderer process
  electronLog.initialize();

  const level = process.env.NODE_ENV === 'development' ? 'debug' : 'silly';

  electronLog.transports.file.level = level;
  electronLog.transports.console.level = level;

  Object.assign(console, electronLog.functions);
}*/

class Logger {
  constructor() {
    console.info('Log from the main process'); // eslint-disable-line no-console
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
