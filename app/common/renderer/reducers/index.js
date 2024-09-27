import {combineReducers} from '@reduxjs/toolkit';

// import {apiSlice} from '../stores/apiSlice';
import applications from '../stores/applicationsSlice';
import devices from '../stores/devicesSlice';
import server from '../stores/serverSlice';
import inspector from './Inspector';
import session from './Session';

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
