export const IS_APPIUM_SERVER_RUNNING = 'IS_APPIUM_SERVER_RUNNING';
export const IS_TEST_SERVER_RUNNING = 'IS_TEST_SERVER_RUNNING';
export const IS_TESTING = 'IS_TESTING';

/**
 * Set whether the appium server is running
 * @param {boolean} running
 */
export function setAppiumServerRunning(running) {
  return (dispatch) => {
    dispatch({type: IS_APPIUM_SERVER_RUNNING, running});
  };
}

/**
 * Set whether the message server is running
 * @param {boolean} running
 */
export function setTestServerRunning(running) {
  return (dispatch) => {
    dispatch({type: IS_TEST_SERVER_RUNNING, running});
  };
}

/**
 * Set whether the test runner is running
 * @param {boolean} running
 */
export function setTesting(running) {
  return (dispatch) => {
    dispatch({type: IS_TESTING, running});
  };
}
