// import { createSlice, createEntityAdapter, nanoid } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

/*
export interface SeverState {
  isAppiumServerRunning: boolean;
  isTestServerRunning: boolean;
  isTesting: boolean;
}

const serverEntity = createEntityAdapter<SeverState>();
*/
/**
 * @typedef {Object} SeverState
 * @property {boolean} isAppiumServerRunning
 * @property {boolean} isTestServerRunning
 * @property {boolean} isTesting
 */
// const serverEntity = createEntityAdapter();

/** @type {SeverState} */
const initialState = {
  isAppiumServerRunning: false,
  isTestServerRunning: false,
  isTesting: false,
};
// } satisfies SeverState as SeverState;

export const serverSlice = createSlice({
  name: 'server',
  initialState,
  /*initialState: {
    test: serverEntity.getInitialState(),
  },*/
  reducers: {
    setAppiumServerRunning(state, /** @type {import('@reduxjs/toolkit').PayloadAction<boolean>} */ action) {
      state.isAppiumServerRunning = action.payload;
    },
    setTestServerRunning(state, /** @type {import('@reduxjs/toolkit').PayloadAction<boolean>} */ action) {
      state.isTestServerRunning = action.payload;
    },
    setTesting(state, /** @type {import('@reduxjs/toolkit').PayloadAction<boolean>} */ action) {
      state.isTesting = action.payload;
    },
  },
  /*selectors: {
    selectorIsAppiumServerRunning: (state) => state.server.isAppiumServerRunning,
    selectorIsTestServerRunning: (state) => state.server.isTestServerRunning,
    selectorIsTesting: (state) => state.server.isTesting,
  },*/
});

// Actions
// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
// export const serverActions = serverSlice.actions;
export const {
  setAppiumServerRunning,
  setTestServerRunning,
  setTesting,
} = serverSlice.actions;

// Selectors
/*
export type TestSlice = {
  [testSlice.name]: ReturnType<(typeof testSlice)['reducer']>
}

export const testSelectors = serverEntity.getSelectors<TestSlice>(
  (state) => state[testSlice.name].test,
);
*/
/*export const testSelectors = serverEntity.getSelectors(
  (state) => state[testSlice.name].test,
);*/
// export const {isTesting} = serverSlice.getSelectors(serverSlice.selectSlice);
// export const serverSelectors = serverSlice.selectors;
export const selectorIsAppiumServerRunning = (state) => state.server.isAppiumServerRunning;
export const selectorIsTestServerRunning = (state) => state.server.isTestServerRunning;
export const selectorIsTesting = (state) => state.server.isTesting;

// Export the slice reducer as the default export
export default serverSlice.reducer;

/*
// NOTE: Usage of Slice
import {useDispatch} from "react-redux";
import {serverActions} from "./store/serverSlice";

const dispatch = useDispatch();
...

dispatch(serverActions.setAppiumServerRunning(true));
 */
