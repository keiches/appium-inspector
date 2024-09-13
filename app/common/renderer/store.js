import {configureStore} from '@reduxjs/toolkit';

import actions from './actions';
import createRootReducer from './reducers';
// import {apiSlice} from '../stores/apiSlice';

const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })/*.concat(apiSlice.middleware)*/,
  devTools:
    process.env.NODE_ENV !== 'development'
      ? false
      : {
          actionCreators: {...actions},
        },
});

export default store;
