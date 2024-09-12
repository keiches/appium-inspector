import {
  SET_DEVICE_LIST,
} from '../actions/Inspector';
import {log} from '../utils/logger';

const INITIAL_STATE = {
  devices: null,
};

export default function devices(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_DEVICE_LIST:
      return {...state, devices: action.devices};

    default:
      return {...state};
  }
}
