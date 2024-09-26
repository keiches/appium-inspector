import {
  IS_APPIUM_SERVER_RUNNING,
  IS_TEST_SERVER_RUNNING,
  IS_TESTING,
} from '../actions/Server';
import {log} from '../utils/logger';

const INITIAL_STATE = {
  isAppiumServerRunning: false,
  isTestServerRunning: false,
  isTesting: false,
};

export default function server(state = INITIAL_STATE, action) {
  switch (action.type) {
    case IS_APPIUM_SERVER_RUNNING:
      return {...state, isAppiumServerRunning: action.isAppiumServerRunning};

    case IS_TEST_SERVER_RUNNING:
      return {...state, isTestServerRunning: action.isTestServerRunning};

    case IS_TESTING:
      return {...state, isTesting: action.isTesting};

    default:
      return {...state};
  }
}
