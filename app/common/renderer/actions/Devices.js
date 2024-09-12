export const READ_DEVICES = 'READ_DEVICES';
export const SET_DEVICES = 'SET_DEVICES';
export const CLEAR_DEVICES = 'CLEAR_DEVICES';

/**
 * Set whether the appium server is running
 * @param {{platform, deviceType}} payload
 */
export function readDevices(payload) {
  return (dispatch) => {
    dispatch({type: READ_DEVICES, payload});
  };
}

/**
 * Set the list of devices
 * @param {any[]} devices
 */
export function setDevices(devices) {
  return (dispatch) => {
    dispatch({type: SET_DEVICES, payload: devices});
  };
}

/**
 * Clear the list of devices
 */
export function clearDevices() {
  return (dispatch) => {
    dispatch({type: CLEAR_DEVICES});
  };
}
