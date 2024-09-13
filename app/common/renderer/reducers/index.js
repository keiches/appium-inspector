import {combineReducers} from '@reduxjs/toolkit';

import inspector from './Inspector';
import session from './Session';
import server from './Server';
// import devices from './Devices';
import devices from '../stores/devicesSlice';
// import applications from './Applications';
import applications from '../stores/applicationsSlice';
// import {apiSlice} from '../stores/apiSlice';

// create our root reducer
export default function createRootReducer() {
  return combineReducers({
    session,
    inspector,
    server,
    devices,
    applications,
    // [apiSlice.reducerPath]: apiSlice.reducer,
   });
}
