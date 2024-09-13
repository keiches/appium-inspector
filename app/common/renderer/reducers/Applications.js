import {log} from '../utils/logger';
import {CLEAR_APPLICATIONS, DELETE_APPLICATION, READ_APPLICATIONS, SELECT_APPLICATION, RESET_APPLICATIONS} from '../actions/Applications.js';
import {ADD_DEVICE} from '../actions/Devices.js';

const INITIAL_STATE = {
  isReading: false,
  items: [],
  selected: null,
};

export default function applications(state = INITIAL_STATE, action) {
  switch (action.type) {
    case READ_APPLICATIONS:
      return {...state, isReading: action.payload};

    case RESET_APPLICATIONS:
      return {...state, items: action.applications, selected: null};

    case CLEAR_APPLICATIONS:
      return {...state, items: [], selected: null};

    case SELECT_APPLICATION:
      return {...state, selected: action.application};

    case ADD_DEVICE:
      return {...state, items: [...state.items, action.application], selected: action.application};

    case DELETE_APPLICATION:
      return {...state, items: state.items.filter((device) => device.id !== action.id), selected: state.selected.id === action.id ? null : state.selected};

    default:
      return {...state};
  }
}
