import {useCallback} from 'react';
import {createSelector} from '@reduxjs/toolkit';
import {sentenceCase} from 'change-case';

import {log} from '../utils/logger';

const getActionName = useCallback(({action, index}) => `${sentenceCase(action)} #${index}`, []);

const actions = (state) => state.recordedActions;
const actionType = (state, actionType) => actionType;

export const actionsSelector = createSelector([actions, actionType], (actionItems, actionType) => {
  const MODULO = 1e9 + 7;
  const actionNameIndexes = new Map();
  return actionItems.map(({action, params}, index) => {
    const actionNameIndex = actionNameIndexes.get(action) || {action, index: 0};
    actionNameIndex.index += 1;
    actionNameIndexes.set(action, actionNameIndex);
    return {
      key: (index % MODULO) + '',
      type: action,
      name: getActionName(actionNameIndex),
      actions: (index % 2) === 0, // TODO:
      params
    };
  });
});
