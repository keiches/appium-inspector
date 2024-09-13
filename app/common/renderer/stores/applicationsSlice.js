import {createSlice} from '@reduxjs/toolkit';
// import { createSlice, createEntityAdapter, nanoid, PayloadAction } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';

import {ipcRenderer} from '../polyfills';
import {AndroidOutlined, AppleOutlined} from '@ant-design/icons';
// import {log} from '../utils/logger.js';

/**
 * @typedef {Object} Application
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
export interface ApplicationState {
  items: Application[];
  selected: Application;
  isReading: boolean;
}

const deviceEntity = createEntityAdapter<ApplicationState>();
*/
/**
 * @typedef {Object} ApplicationState
 * @property {Application[]} items
 * @property {Application|null} selected
 * @property {boolean} isReading
 */
// const deviceEntity = createEntityAdapter();

/** @type {ApplicationState} */
const initialState = {
  items: [],
  selected: null,
  isReading: false,
};
// } satisfies ApplicationState as ApplicationState;

// noinspection DuplicatedCode
export const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    /**
     * Set loading status
     * @param {ApplicationState} state
     * @param {{payload: boolean}} action
     */
    setLoading: (state, action) => {
      state.isReading = action.payload;
    },
    /**
     * Read items
     * @param {ApplicationState} state
     * @param {{payload: Application[]}} action
     */
    resetApplications: (state, action) => {
      state.items = action.payload;
      state.selected = null;
    },
    clearApplications: (state) => {
      state.items = [];
      state.selected = null;
    },
    selectApplication: (state, action) => {
      state.selected = action.payload;
    },
    addApplication: (state, action) => {
      state.items.push(action.payload);
      state.selected = action.payload;
    },
    deleteApplication: (state, action) => {
      state.items = state.items.filter((app) => app.id !== action.payload);
      if (state.selected && state.selected.id === action.payload) {
        state.selected = null;
      }
    },
  },
});

export const {
  setLoading,
  resetApplications,
  clearApplications,
  selectApplication,
  addApplication,
  deleteApplication,
} = applicationsSlice.actions;

// Thunk action creators
/**
 * Send request to read the list of applications
 * @param {string} platform
 * @returns {(function(*): Promise<void>)|*}
 */
export const readApplications = (platform) => async (dispatch) => {
  dispatch(setLoading(true));
  ipcRenderer.send('applications:read', {
    platform,
  });
  // Simulating API call
  await new Promise((resolve) => {
    const applications = [];
    // TODO: Read the APKs and the IPAs(zip) from the disk (target location)
    setTimeout(() => {
      // TODO: When the API call is done
      applications.push(...[
        {
          platform: {
            name: 'Android',
            icon: AndroidOutlined,
          },
          app: 'apps/Android-MyDemoAppRN.1.3.0.build-244.apk',
          package: 'com.saucelabs.mydemoapp.rn',
          activity: '.MainActivity',
          version: '384.0.150',
          status: 'Ready',
        },
        {
          platform: {
            name: 'iOS',
            icon: AppleOutlined,
          },
          app: 'apps/Android-MyDemoAppRN.1.3.0.build-244.zip',
          package: 'com.saucelabs.mydemoapp.rn',
          activity: '.MainActivity',
          version: '23.6.7',
          status: 'Ready',
        },
        {
          platform: {
            name: 'Android',
            icon: AndroidOutlined,
          },
          app: 'apps/Android-MyDemoAppRN.1.3.0.build-244.apk',
          package: 'com.saucelabs.mydemoapp.rn',
          activity: '.MainActivity',
          version: '12.3.2',
          status: 'Ready',
        },
      ].slice(Math.floor(Math.random()), Math.floor(Math.random() * 2) + 1));
      resolve(applications);
    }, 1000);
  }).then((applications) => {
    dispatch(resetApplications(applications));
  }).finally(() => {
    dispatch(setLoading(false));
  });
};

// Selectors
// export const applicationSelectors = deviceSlice.getSelectors(deviceSlice.selectSlice);
export const selectorApplications = (state) => state.applications.items;
export const selectorSelectedApplication = (state) => state.applications.selected;
export const selectorIsReading = (state) => state.applications.isReading;

export default applicationsSlice.reducer;

/*
// NOTE: Usage of Slice
import { useSelector, useDispatch } from 'react-redux';
import {
  selectApplications,
  selectSelectedApplication,
  selectIsReading,
  readApplications,
  selectApplication,
  deleteApplication
} from './applicationsSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const applications = useSelector(selectApplications);
  const selectedApp = useSelector(selectSelectedApplication);
  const isReading = useSelector(selectIsReading);

  useEffect(() => {
    dispatch(readApplications());
  }, [dispatch]);

  // ... 나머지 컴포넌트 로직
}
 */
