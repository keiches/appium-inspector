import {log} from '../utils/logger';
import {
  READ_DEVICES, RESET_DEVICES, CLEAR_DEVICES, SELECT_DEVICE, ADD_DEVICE, DELETE_DEVICE
} from '../actions/Devices.js';

/*
interface Device {
  name: string; // [sdk_gphone64_x86_64]
  model: string; // [sdk_gphone64_x86_64]
  device: string; // [emulator64_x86_64_arm64]
  brand: string; // [google]
  manufacturer: string; // [Google]
}
*/
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
interface DeviceState {
  items: Device[];
  selected: Device;
  isLoading: boolean;
}
*/
/**
 * @typedef {Object} DeviceState
 * @property {Device[]} items
 * @property {Device} selected
 * @property {boolean} isLoading
 */
const INITIAL_STATE = {
  isLoading: false,
  items: [],
  selected: null,
};
// } satisfies DeviceState as DeviceState;

export default function devices(state = INITIAL_STATE, action) {
  switch (action.type) {
    case READ_DEVICES:
      return {...state, isLoading: action.payload};

    case RESET_DEVICES:
      return {...state, items: action.devices, selected: null};

    case CLEAR_DEVICES:
      return {...state, items: [], selected: null};

    case SELECT_DEVICE:
      return {...state, selected: action.device};

    case ADD_DEVICE:
      return {...state, items: [...state.items, action.device], selected: action.device};

    case DELETE_DEVICE:
      return {...state, items: state.devices.filter((device) => device.id !== action.id), selected: state.selected.id === action.id ? null : state.selected};

    default:
      return {...state};
  }
}
