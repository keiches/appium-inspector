import { combineSlices } from '@reduxjs/toolkit';

import {serverSlice} from '../serverSlice.js';
import {inspectorSlice} from './inspectorSlice';

export default combineSlices(inspectorSlice, serverSlice);
