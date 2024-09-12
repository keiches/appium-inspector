import {
  createSlice,
  /*
  createEntityAdapter,
  nanoid,
  PayloadAction,*/
} from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';
import {ipcRenderer} from '../polyfills';
import {log} from '../utils/logger.js';

/*
export interface DeviceState {
  devices: any[];
  isLoading: boolean;
}

const deviceEntity = createEntityAdapter<DeviceState>();
*/
/**
 * @typedef {Object} DeviceState
 * @property {any[]} devices
 * @property {boolean} isLoading
 */
// const deviceEntity = createEntityAdapter();

/** @type {DeviceState} */
const initialState = {
  devices: [],
  isLoading: false,
};
// } satisfies DeviceState as DeviceState;

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  /*initialState: {
    devices: deviceEntity.getInitialState(),
  },*/
  reducers: {
    /**
     * Read devices
     * @param {DeviceState} state
     * @param {{payload: any[]}} action
     */
    setDevices(state, action) {
      state.devices = [...action.payload];
    },
    /**
     * Read devices
     * @param {DeviceState} state
     * @param {{payload: {platform: string; deviceType: string}}} action
     */
    readDevices(state, action) {
      const {platform, deviceType} = action.payload;
      state.isLoading = true;
      ipcRenderer.send('read-devices', {
        platform,
        deviceType,
      });
      state.devices = [{
        platform,
        deviceType,
        payload: action.payload,
      }];
    },
    clearDevices(state) {
      state.devices = [];
    },
  },
  selectors: {
    devices: (state) => state.devices,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const deviceActions = deviceSlice.actions;

/*
export type DeviceSlice = {
  [deviceSlice.name]: ReturnType<(typeof deviceSlice)['reducer']>
}

export const deviceSelectors = deviceEntity.getSelectors<DeviceSlice>(
  (state) => state[deviceSlice.name].device,
);
*/
/*export const deviceSelectors = deviceEntity.getSelectors(
  (state) => state[deviceSlice.name].device,
);*/
export const {devices} = deviceSlice.getSelectors(deviceSlice.selectSlice);

// Export the slice reducer as the default export
export default deviceSlice.reducer;

/* Usages
import {useDispatch} from "react-redux";
import {deviceActions} from "./store/deviceSlice";

const dispatch = useDispatch();
...

dispatch(deviceActions.readDevices([]));
 */
