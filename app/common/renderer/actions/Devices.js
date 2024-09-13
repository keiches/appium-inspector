export const READ_DEVICES = 'READ_DEVICES';
export const RESET_DEVICES = 'RESET_DEVICES';
export const CLEAR_DEVICES = 'CLEAR_DEVICES';
export const SELECT_DEVICE = 'SELECT_DEVICE';
export const ADD_DEVICE = 'ADD_DEVICE';
export const DELETE_DEVICE = 'DELETE_DEVICE';

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
export function resetDevices(devices) {
  return (dispatch) => {
    dispatch({type: RESET_DEVICES, payload: devices});
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

/**
 * Select a device
 * @param {any} device
 */
export function selectDevice(device) {
  return (dispatch) => {
    dispatch({type: SELECT_DEVICE, payload: device});
  };
}

/**
 * Add a device
 * @param {any} device
 */
export function addDevice(device) {
  return (dispatch) => {
    dispatch({type: ADD_DEVICE, payload: device});
  };
}

/**
 * Delete the device
 * @param {any} device
 */
export function deleteDevice(device) {
  return (dispatch) => {
    dispatch({type: DELETE_DEVICE, payload: device});
  };
}
