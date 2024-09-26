import electronLog from 'electron-log/renderer';

// if (import.meta.env.VITE_ELECTRON_LOG) {
if (process.env.ELECTRON_LOG) {
  Object.assign(console, electronLog.functions);
}

function toFormattedString(date) {
  // noinspection DuplicatedCode
  return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
}

class Logger {
  _options = {
    showTime: false,
  };

  constructor(options = {}) {
    this._options = {...options};
    console.info(options.subtitle ? `Log from ${options.subtitle}` : 'Log from the renderer process'); // eslint-disable-line no-console
  }

  setOptions(options) {
    this._options = {...this._options, ...options};
  }

  debug(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${toFormattedString(new Date())}]`);
    }
    console.info(...message); // eslint-disable-line no-console
  }

  info(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${toFormattedString(new Date())}]`);
    }
    console.info(...message); // eslint-disable-line no-console
  }

  log(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${toFormattedString(new Date())}]`);
    }
    console.info(...message); // eslint-disable-line no-console
  }

  warn(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${toFormattedString(new Date())}]`);
    }
    console.warn(...message); // eslint-disable-line no-console
  }

  error(...args) {
    const message = [...args];
    if (this._options.showTime) {
      message.unshift(`[${toFormattedString(new Date())}]`);
    }
    console.error(...message); // eslint-disable-line no-console
  }
}

export const log = new Logger({showTime: true});
