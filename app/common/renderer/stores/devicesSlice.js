import {createSlice} from '@reduxjs/toolkit';
// import { createSlice, createEntityAdapter, nanoid, PayloadAction } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';

import {ipcRenderer} from '../polyfills';
import {AndroidOutlined, AppleOutlined} from '@ant-design/icons';
// import {log} from '../utils/logger.js';

/**
 * @typedef {Object} Device
 * @property {string} name
 * @property {string} model
 * @property {string} device
 * @property {string} version
 * @property {string} sdk
 * @property {string} brand
 * @property {string} manufacturer
 * @property {string} platform
 */
/*
export interface DeviceState {
  items: Device[];
  selected: Device;
  isReading: boolean;
}

const deviceEntity = createEntityAdapter<DeviceState>();
*/
/**
 * @typedef {Object} DeviceState
 * @property {Device[]} items
 * @property {Device|null} selected
 * @property {boolean} isReading
 */
// const deviceEntity = createEntityAdapter();

/** @type {DeviceState} */
const initialState = {
  items: [],
  selected: null,
  isReading: false,
};
// } satisfies DeviceState as DeviceState;

// noinspection DuplicatedCode
export const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    /**
     * Set loading status
     * @param {DeviceState} state
     * @param {{payload: boolean}} action
     */
    setLoading: (state, action) => {
      state.isReading = action.payload;
    },
    /**
     * Read items
     * @param {DeviceState} state
     * @param {{payload: Device[]}} action
     */
    resetDevices: (state, action) => {
      state.items = action.payload;
      state.selected = null;
    },
    clearDevices: (state) => {
      state.items = [];
      state.selected = null;
    },
    selectDevice: (state, action) => {
      state.selected = action.payload;
    },
    addDevice: (state, action) => {
      state.items.push(action.payload);
      state.selected = action.payload;
    },
    deleteDevice: (state, action) => {
      state.items = state.items.filter((app) => app.id !== action.payload);
      if (state.selected && state.selected.id === action.payload) {
        state.selected = null;
      }
    },
  },
});

export const {
  setLoading,
  resetDevices,
  clearDevices,
  selectDevice,
  addDevice,
  deleteDevice,
} = devicesSlice.actions;

// Thunk action creators
/**
 * Send request to read the list of devices
 * @param {string} platform
 * @param {string} deviceType
 */
export const readDevices = (platform, deviceType) => async (dispatch) => {
  dispatch(setLoading(true));
  ipcRenderer.send('devices:read', {
    platform,
    deviceType,
  });
  // Simulating API call
  await new Promise((resolve) => {
    const devices = [];
    // TODO: Read the APKs and the IPAs(zip) from the disk (target location)
    setTimeout(() => {
      // TODO: When the API call is done
      devices.push(...[
        {
          key: 'DEVICE#1',
          name: 'emulator-5554', // 'Pixel_7_API_31',
          platform: {
            name: 'Android', // TODO: read using adb
            version: '12.0',
            icon: AndroidOutlined, // TODO: assign according to platform.name
          },
          udid: 'emulator-5554', // TODO: read using adb (serial)
          status: 'Ready',
        },
        {
          key: 'DEVICE#2',
          name: 'emulator-5555', // 'Pixel_7_API_33',
          platform: {
            name: 'Android', // TODO: read using adb
            version: '13.0',
            icon: AndroidOutlined, // TODO: assign according to platform.name
          },
          udid: 'emulator-5555', // TODO: read using adb (serial)
          status: 'Ready',
        },
        {
          key: 'DEVICE#3',
          name: 'iPhone 13 Pro',
          platform: {
            name: 'iOS', // TODO: read using libs
            version: '17.5.1', // TODO: read using libs
            icon: AppleOutlined, // TODO: assign according to platform.name
          },
          udid: 'iPhone13,1', // TODO: read using adb
          status: 'Ready',
        },
      ].slice(Math.floor(Math.random()), Math.floor(Math.random() * 2) + 1));
      resolve(devices);
    }, 1000);
  }).then((devices) => {
    dispatch(resetDevices(devices));
  }).finally(() => {
    dispatch(setLoading(false));
  });
};

// Selectors
// export const deviceSelectors = deviceSlice.getSelectors(deviceSlice.selectSlice);
export const selectorDevices = (state) => state.devices.items;
export const selectorSelectedDevice = (state) => state.devices.selected;
export const selectorIsReading = (state) => state.devices.isReading;

export default devicesSlice.reducer;

/*
// NOTE: Usage of Slice
import { useSelector, useDispatch } from 'react-redux';
import {
  selectDevices,
  selectSelectedDevice,
  selectIsReading,
  readDevices,
  selectDevice,
  deleteDevice
} from './devicesSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);
  const selectedApp = useSelector(selectSelectedDevice);
  const isReading = useSelector(selectIsReading);

  useEffect(() => {
    dispatch(readDevices());
  }, [dispatch]);

  // ... 나머지 컴포넌트 로직
}
 */
