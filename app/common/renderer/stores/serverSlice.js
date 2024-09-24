import {
  createSlice,
  /*
  createEntityAdapter,
  nanoid,
  PayloadAction,*/
} from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';

/*
export interface SeverState {
  isTesting: boolean;
}

const serverEntity = createEntityAdapter<SeverState>();
*/
/**
 * @typedef {Object} SeverState
 * @property {boolean} isAppiumServerRunning
 * @property {boolean} isTestRunnerRunning
 * @property {boolean} isTesting
 */
// const serverEntity = createEntityAdapter();

/** @type {SeverState} */
const initialState = {
  isAppiumServerRunning: false,
  isMessageServerRunning: false,
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
    setMessageServerRunning(state, /** @type {import('@reduxjs/toolkit').PayloadAction<boolean>} */ action) {
      state.isMessageServerRunning = action.payload;
    },
    setIsTesting(state, /** @type {import('@reduxjs/toolkit').PayloadAction<boolean>} */ action) {
      state.isTesting = action.payload;
    },
  },
  selectors: {
    isAppiumServerRunning: (state) => state.isAppiumServerRunning,
    isMessageServerRunning: (state) => state.isMessageServerRunning,
    isTesting: (state) => state.isTesting,
  },
});

// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const serverActions = serverSlice.actions;

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
export const serverSelectors = serverSlice.selectors;

// Export the slice reducer as the default export
export default serverSlice.reducer;

/* Usages
import {useDispatch} from "react-redux";
import {serverActions} from "./store/serverSlice";

const dispatch = useDispatch();
...

dispatch(serverActions.setAppiumServerRunning(true));
 */
