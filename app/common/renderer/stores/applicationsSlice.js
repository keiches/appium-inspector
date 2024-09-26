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
 * @property {Error|null} error
 * @property {string} status
 */
// const deviceEntity = createEntityAdapter();

/** @type {ApplicationState} */
const initialState = {
  items: [],
  selected: null,
  isReading: false,
  error: null,
  status: 'idle',
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
  /*
  extraReducers: (builder) => {
    builder
      .addCase(readApplications.pending, (state) => {
        state.isReading = true;
        state.status = 'loading';
      })
      .addCase(readApplications.fulfilled, (state, action) => {
        state.isReading = false;
        state.status = 'succeeded';
        state.items = action.payload;
        state.selected = null;
      })
      .addCase(readApplications.rejected, (state, action) => {
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
  resetApplications,
  clearApplications,
  selectApplication,
  addApplication,
  deleteApplication,
} = applicationsSlice.actions;

// Thunk action creators
/**
 * Send request to read the list of applications
 * @param {{platform: string}} payload
 */
export const readApplications = (payload) => async (dispatch) => {
  const {platform} = payload;
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
/*export const readApplications = createAsyncThunk(
  'applicationsSlice/readApplications',
  async (payload, {dispatch, rejectWithValue}) => {
    const {platform} = payload;
    dispatch(setLoading(true));
    try {
      ipcRenderer.send('applications:read', {
        platform,
      });
      // Simulating API call
      const response = await new Promise((resolve) => {
        // TODO: Read the APKs and the IPAs(zip) from the disk (target location)
        ipcRenderer.once('applications:reset', (_, applications) => {
          resolve(applications);
        });
        // DEBUG:
        setTimeout(() => {
          const applications = [];
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
      });
      /*if (!response.ok) {
        return rejectWithValue('failed to read applications list');
      }
      const applications = await response.json();*/
      const applications = response;
      dispatch(resetApplications(applications));
      return applications;
    } catch (error) {
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);*/

// Selectors
// export const applicationsSelectors = applicationsSlice.getSelectors(applicationsSlice.selectSlice);
export const selectorApplications = (state) => state.applications.items;
export const selectorSelectedApplication = (state) => state.applications.selected;
export const selectorIsReading = (state) => state.applications.isReading;

// Export the slice reducer as the default export
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

  // ... ?�머지 컴포?�트 로직
}
 */
