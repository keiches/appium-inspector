import {AndroidOutlined, AppleOutlined} from '@ant-design/icons';
// import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

import {ipcRenderer} from '../polyfills';
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
 * @property {Error|null} error
 * @property {string} status
 */
// const deviceEntity = createEntityAdapter();

/** @type {DeviceState} */
const initialState = {
  items: [],
  selected: null,
  isReading: false,
  error: null,
  status: 'idle',
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
  /*
  extraReducers: (builder) => {
    builder
      .addCase(readDevices.pending, (state) => {
        state.isReading = true;
        state.status = 'loading';
      })
      .addCase(readDevices.fulfilled, (state, action) => {
        state.isReading = false;
        state.status = 'succeeded';
        state.items = action.payload;
        state.selected = null;
      })
      .addCase(readDevices.rejected, (state, action) => {
        state.isReading = false;
        state.status = 'failed';
        state.error = action.payload;
      });
  },
  */
});

// Actions
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
 * @param {{platform: string; deviceType: string}} payload
 */
export const readDevices = (payload) => async (dispatch) => {
  const {platform, deviceType} = payload;
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
          name: 'emulator-5554', // 'Pixel_7_API_33',
          platform: {
            name: 'Android', // TODO: read using adb
            version: '13.0',
            icon: AndroidOutlined, // TODO: assign according to platform.name
          },
          udid: 'emulator-5554', // TODO: read using adb (serial)
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
/*export const readDevices = createAsyncThunk(
  'devicesSlice/readDevices',
  async (payload, {dispatch, rejectWithValue}) => {
    const {platform, deviceType} = payload;
    dispatch(setLoading(true));
    try {
      ipcRenderer.send('devices:read', {
        platform,
        deviceType,
      });
      // Simulating API call
      const response = await new Promise((resolve) => {
        // TODO: Read the APKs and the IPAs(zip) from the disk (target location)
        ipcRenderer.once('devices:reset', (_, devices) => {
          resolve(devices);
        });
        // DEBUG:
        setTimeout(() => {
          const devices = [];
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
              name: 'emulator-5554', // 'Pixel_7_API_33',
              platform: {
                name: 'Android', // TODO: read using adb
                version: '13.0',
                icon: AndroidOutlined, // TODO: assign according to platform.name
              },
              udid: 'emulator-5554', // TODO: read using adb (serial)
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
      });
      /*if (!response.ok) {
        return rejectWithValue('failed to read device list');
      }
      const devices = await response.json();*/
      const devices = response;
      dispatch(resetDevices(devices));
      return devices;
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);*/

// Selectors
// export const devicesSelectors = devicesSlice.getSelectors(devicesSlice.selectSlice);
export const selectorDevices = (state) => state.devices.items;
export const selectorSelectedDevice = (state) => state.devices.selected;
export const selectorIsReading = (state) => state.devices.isReading;

// Export the slice reducer as the default export
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

  // ... ?�머지 컴포?�트 로직
}
 */
