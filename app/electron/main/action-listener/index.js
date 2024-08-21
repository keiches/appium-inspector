// import blake2 from 'blake2';
// console.log('ExecPath', process.execPath);

import {log} from '../logger';

/**
 *
 */
process.on('message', (message, sendHandle) => {
  log.log('Got message:', message);
  // const h = blake2.createHash('blake2b', {digestLength: 32});
  // h.update(Buffer.from(m));
  // process.send(`Hash of ${m} is: ${h.digest('hex')}`);
  process.send(`[${message}]`, sendHandle);
});
