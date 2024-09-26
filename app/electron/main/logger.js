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
  _options = {
    showTime: false,
  };

  constructor(options = {}) {
    this._options = {...options};
    console.info(options.subtitle ? `Log from ${options.subtitle}` : 'Log from the main process'); // eslint-disable-line no-console
  }

  setOptions(options) {
    this._options = {...this._options, ...options};
  }

  debug(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${(new Date()).toFormattedString()}]`);
    }
    console.debug(...message); // eslint-disable-line no-console
  }

  info(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${(new Date()).toFormattedString()}]`);
    }
    console.info(...message); // eslint-disable-line no-console
  }

  log(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${(new Date()).toFormattedString()}]`);
    }
    console.info(...message); // eslint-disable-line no-console
  }

  warn(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${(new Date()).toFormattedString()}]`);
    }
    console.warn(...message); // eslint-disable-line no-console
  }

  error(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${(new Date()).toFormattedString()}]`);
    }
    console.error(...message); // eslint-disable-line no-console
  }
}

export const log = new Logger({showTime: true});
