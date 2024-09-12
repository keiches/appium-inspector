import {combineReducers} from '@reduxjs/toolkit';

import inspector from './Inspector';
import session from './Session';
import server from './Server';
import devices from './Devices';

// create our root reducer
export default function createRootReducer() {
  return combineReducers({
    session,
    inspector,
    server,
    devices,
  });
}
