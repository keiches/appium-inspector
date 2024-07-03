/*
import {logger} from '@appium/support';

const log = logger.getLogger('AppiumDoctor');

export default log;
*/
import log from 'electron-log';

// Optional, initialize the logger for any renderer process
// log.initialize();

const level = process.env.NODE_ENV === 'development' ? 'debug' : 'silly';

log.transports.file.level = level;
log.transports.console.level = level;

// log.info('Log from the main process');

export default log;
