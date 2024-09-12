import { combineSlices } from '@reduxjs/toolkit';
import {inspectorSlice} from './inspectorSlice';
import {serverSlice} from '../serverSlice.js';

export default combineSlices(inspectorSlice, serverSlice);
