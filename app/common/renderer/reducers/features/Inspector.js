import {createSlice} from '@reduxjs/toolkit';
import {omit} from 'lodash';

import {SCREENSHOT_INTERACTION_MODE} from '../../constants/screenshot';
import {APP_MODE, INSPECTOR_TABS, NATIVE_APP} from '../../constants/session-inspector';

const DEFAULT_FRAMEWORK = 'java';

const INITIAL_STATE = {
  savedGestures: [],
  driver: null,
  automationName: null,
  keepAliveInterval: null,
  showKeepAlivePrompt: false,
  userWaitTimeout: null,
  lastActiveMoment: null,
  expandedPaths: ['0'],
  isRecording: false,
  isSourceRefreshOn: true,
  showBoilerplate: false,
  recordedActions: [],
  actionFramework: DEFAULT_FRAMEWORK,
  sessionDetails: {},
  isGestureEditorVisible: false,
  isLocatorTestModalVisible: false,
  isSiriCommandModalVisible: false,
  siriCommandValue: '',
  showCentroids: false,
  locatorTestStrategy: 'id',
  locatorTestValue: '',
  isSearchingForElements: false,
  assignedVarCache: {},
  screenshotInteractionMode: SCREENSHOT_INTERACTION_MODE.SELECT,
  searchedForElementBounds: null,
  selectedInspectorTab: INSPECTOR_TABS.SOURCE,
  appMode: APP_MODE.NATIVE,
  mjpegScreenshotUrl: null,
  pendingCommand: null,
  findElementsExecutionTimes: [],
  isFindingElementsTimes: false,
  isFindingLocatedElementInSource: false,
  visibleCommandResult: null,
  visibleCommandMethod: null,
  isAwaitingMjpegStream: true,
  showSourceAttrs: false,
  showActionSource: false,
  devices: null,
};

let nextState;

const inspectorSlice = createSlice({
  name: 'inspector',
  initialState: INITIAL_STATE,
  reducers: {
    setSourceAndScreenshot(state, action) {
      state.inspector = {
        ...state.inspector,
        contexts: action.contexts,
        contextsError: action.contextsError,
        currentContext: action.currentContext || NATIVE_APP,
        currentContextError: action.currentContextError,
        sourceJSON: action.sourceJSON,
        sourceXML: action.sourceXML,
        sourceError: action.sourceError,
        screenshot: action.screenshot,
        screenshotError: action.screenshotError,
        windowSize: action.windowSize,
        windowSizeError: action.windowSizeError,
        findElementsExecutionTimes: [],
      };
    },
    quitSessionRequested(state, _action) {
      state.inspector = {
        ...state.inspector,
        methodCallInProgress: true,
        isQuittingSession: true,
      };
    },
    quitSessionDone(state, _action) {
      state.inspector = {
        ...INITIAL_STATE,
      };
    },
    sessionDone(state, _action) {
      state.inspector = {
        ...state.inspector,
        isSessionDone: true,
        methodCallInProgress: false,
      };
    },
    selectElement(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedElement: action.selectedElement,
        selectedElementPath: action.selectedElement.path,
        selectedElementId: null,
        selectedElementSearchInProgress: true,
        elementInteractionsNotAvailable: false,
        findElementsExecutionTimes: [],
      };
    },
    setOptimalLocators(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedElement: {
          ...state.selectedElement,
          strategyMap: action.strategyMap,
        },
      };
    },
    unselectElement(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedElement: undefined,
        selectedElementPath: null,
        selectedElementId: null,
        selectedElementSearchInProgress: false,
      };
    },
    selectCentroid(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedCentroid: action.path,
      };
    },
    unselectCentroid(state, action) {
      state.inspector = omit(state, 'selectedCentroid');
    },
    setSelectedElementId(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedElementId: action.elementId,
        selectedElementSearchInProgress: false,
        findElementsExecutionTimes: [],
      };
    },

    SET_INTERACTIONS_NOT_AVAILABLE(state, action) {
      state.inspector = {
        ...state.inspector,
        elementInteractionsNotAvailable: true,
        selectedElementSearchInProgress: false,
      };
    },

    SELECT_HOVERED_ELEMENT(state, action) {
      state.inspector = {
        ...state.inspector,
        hoveredElement: action.hoveredElement,
      };
    },

    UNSELECT_HOVERED_ELEMENT(state, action) {
      state.inspector = omit(state, 'hoveredElement');
    },

    SELECT_HOVERED_CENTROID(state, action) {
      state.inspector = {
        ...state.inspector,
        hoveredCentroid: action.path,
      };
    },

    UNSELECT_HOVERED_CENTROID(state, action) {
      state.inspector = omit(state, 'hoveredCentroid');
    },

    METHOD_CALL_REQUESTED(state, action) {
      state.inspector = {
        ...state.inspector,
        methodCallInProgress: true,
      };
    },

    METHOD_CALL_DONE(state, action) {
      state.inspector = {
        ...state.inspector,
        methodCallInProgress: false,
      };
    },

    SET_EXPANDED_PATHS(state, action) {
      state.inspector = {
        ...state.inspector,
        expandedPaths: action.paths,
        findElementsExecutionTimes: [],
      };
    },

    START_RECORDING(state, action) {
      state.inspector = {
        ...state.inspector,
        isRecording: true,
      };
    },

    PAUSE_RECORDING(state, action) {
      state.inspector = {
        ...state.inspector,
        isRecording: false,
      };
    },

    CLEAR_RECORDING(state, action) {
      state.inspector = {
        ...state.inspector,
        recordedActions: [],
      };
    },

    SET_ACTION_FRAMEWORK(state, action) {
      state.inspector = {
        ...state.inspector,
        actionFramework: action.framework || DEFAULT_FRAMEWORK,
      };
    },

    recordAction(state, action) {
      state.inspector = {
        ...state.inspector,
        recordedActions: [...state.recordedActions, {action: action.action, params: action.params}],
      };
    },

    addAssignedVarCache(state, action) {
      state.inspector = {
        ...state.inspector,
        assignedVarCache: {
          ...state.assignedVarCache,
          [action.varName]: true,
        },
      };
    },

    CLEAR_ASSIGNED_VAR_CACHE(state, action) {
      state.inspector = {
        ...state.inspector,
        assignedVarCache: [],
      };
    },

    SET_SHOW_BOILERPLATE(state, action) {
      state.inspector = {
        ...state.inspector, showBoilerplate: action.show
      };
    },

    SET_SHOW_ACTION_SOURCE(state, action) {
      state.inspector = {
        ...state.inspector, showActionSource: action.show
      };
    },

    SET_SESSION_DETAILS(state, action) {
      const automationName = action.driver.client.capabilities.automationName;
      state.inspector = {
        ...state,
        sessionDetails: action.sessionDetails,
        driver: action.driver,
        automationName: automationName && automationName.toLowerCase(),
        appMode: action.mode,
        mjpegScreenshotUrl: action.mjpegScreenshotUrl,
      };
    },

    SHOW_LOCATOR_TEST_MODAL(state, action) {
      state.inspector = {
        ...state.inspector,
        isLocatorTestModalVisible: true,
      };
    },

    HIDE_LOCATOR_TEST_MODAL(state, action) {
      state.inspector = {
        ...state.inspector,
        isLocatorTestModalVisible: false,
      };
    },

    SHOW_SIRI_COMMAND_MODAL(state, action) {
      state.inspector = {
        ...state.inspector,
        isSiriCommandModalVisible: true,
      };
    },

    HIDE_SIRI_COMMAND_MODAL(state, action) {
      state.inspector = {
        ...state.inspector,
        isSiriCommandModalVisible: false,
      };
    },

    SET_SIRI_COMMAND_VALUE(state, action) {
      state.inspector = {
        ...state.inspector,
        siriCommandValue: action.siriCommandValue,
      };
    },

    SET_LOCATOR_TEST_STRATEGY(state, action) {
      state.inspector = {
        ...state.inspector,
        locatorTestStrategy: action.locatorTestStrategy,
      };
    },

    SET_LOCATOR_TEST_VALUE(state, action) {
      state.inspector = {
        ...state.inspector,
        locatorTestValue: action.locatorTestValue,
      };
    },

    SEARCHING_FOR_ELEMENTS(state, action) {
      state.inspector = {
        ...state.inspector,
        locatedElements: null,
        locatedElementsExecutionTime: null,
        locatorTestElement: null,
        isSearchingForElements: true,
      };
    },

    SEARCHING_FOR_ELEMENTS_COMPLETED(state, action) {
      state.inspector = {
        ...state.inspector,
        locatedElements: action.elements,
        locatedElementsExecutionTime: action.executionTime,
        isSearchingForElements: false,
      };
    },

    GET_FIND_ELEMENTS_TIMES(state, action) {
      state.inspector = {
        ...state.inspector,
        isFindingElementsTimes: true,
      };
    },

    GET_FIND_ELEMENTS_TIMES_COMPLETED(state, action) {
      state.inspector = {
        ...state.inspector,
        findElementsExecutionTimes: action.findElementsExecutionTimes,
        isFindingElementsTimes: false,
      };
    },

    SET_LOCATOR_TEST_ELEMENT(state, action) {
      state.inspector = {
        ...state.inspector,
        locatorTestElement: action.elementId,
      };
    },

    FINDING_ELEMENT_IN_SOURCE(state, action) {
      state.inspector = {
        ...state.inspector,
        isFindingLocatedElementInSource: true,
      };
    },

    FINDING_ELEMENT_IN_SOURCE_COMPLETED(state, action) {
      state.inspector = {
        ...state.inspector,
        isFindingLocatedElementInSource: false,
      };
    },

    CLEAR_SEARCH_RESULTS(state, action) {
      state.inspector = {
        ...state.inspector,
        locatedElements: null,
        isFindingLocatedElementInSource: false,
      };
    },

    SET_SCREENSHOT_INTERACTION_MODE(state, action) {
      state.inspector = {
        ...state.inspector,
        screenshotInteractionMode: action.screenshotInteractionMode,
      };
    },

    SET_COORD_START(state, action) {
      state.inspector = {
        ...state.inspector,
        coordStart: {
          x: action.coordStartX,
          y: action.coordStartY,
        },
      };
    },

    SET_COORD_END(state, action) {
      state.inspector = {
        ...state.inspector,
        coordEnd: {
          x: action.coordEndX,
          y: action.coordEndY,
        },
      };
    },

    CLEAR_COORD_ACTION(state, action) {
      state.inspector = {
        ...state.inspector,
        coordStart: null,
        coordEnd: null,
      };
    },

    SET_SEARCHED_FOR_ELEMENT_BOUNDS(state, action) {
      state.inspector = {
        ...state.inspector,
        searchedForElementBounds: {
          location: action.location,
          size: action.size,
        },
      };
    },

    CLEAR_SEARCHED_FOR_ELEMENT_BOUNDS(state, action) {
      state.inspector = {
        ...state.inspector,
        searchedForElementBounds: null,
      };
    },

    PROMPT_KEEP_ALIVE(state, action) {
      state.inspector = {
        ...state.inspector,
        showKeepAlivePrompt: true,
      };
    },

    HIDE_PROMPT_KEEP_ALIVE(state, action) {
      state.inspector = {
        ...state.inspector,
        showKeepAlivePrompt: false,
      };
    },

    SELECT_INSPECTOR_TAB(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedInspectorTab: action.interaction,
      };
    },

    SET_APP_MODE(state, action) {
      state.inspector = {
        ...state.inspector,
        appMode: action.mode,
      };
    },

    SET_SHOW_CENTROIDS(state, action) {
      state.inspector = {
        ...state.inspector,
        showCentroids: action.show,
      };
    },

    ENTERING_COMMAND_ARGS(state, action) {
      state.inspector = {
        ...state.inspector,
        pendingCommand: {
          commandName: action.commandName,
          command: action.command,
          args: [],
        },
      };
    },

    SET_COMMAND_ARG(state, action) {
      state.inspector = {
        ...state.inspector,
        pendingCommand: {
          ...state.pendingCommand,
          args: Object.assign([], state.pendingCommand.args, {[action.index]: action.value}), // Replace 'value' at 'index'
        },
      };
    },

    CANCEL_PENDING_COMMAND(state, action) {
      state.inspector = {
        ...state.inspector,
        pendingCommand: null,
      };
    },

    SET_CONTEXT(state, action) {
      state.inspector = {
        ...state.inspector,
        currentContext: action.context,
      };
    },

    SET_KEEP_ALIVE_INTERVAL(state, action) {
      state.inspector = {
        ...state.inspector,
        keepAliveInterval: action.keepAliveInterval,
      };
    },

    SET_USER_WAIT_TIMEOUT(state, action) {
      state.inspector = {
        ...state.inspector,
        userWaitTimeout: action.userWaitTimeout,
      };
    },

    SET_LAST_ACTIVE_MOMENT(state, action) {
      state.inspector = {
        ...state.inspector,
        lastActiveMoment: action.lastActiveMoment,
      };
    },

    SET_VISIBLE_COMMAND_RESULT(state, action) {
      state.inspector = {
        ...state.inspector,
        visibleCommandResult: action.result,
        visibleCommandMethod: action.methodName,
      };
    },

    SET_SESSION_TIME(state, action) {
      state.inspector = {
        ...state.inspector,
        sessionStartTime: action.sessionStartTime,
      };
    },

    SET_APP_ID(state, action) {
      state.inspector = {
        ...state.inspector,
        appId: action.appId,
      };
    },

    SET_SERVER_STATUS(state, action) {
      state.inspector = {
        ...state.inspector,
        status: action.status,
      };
    },

    SET_AWAITING_MJPEG_STREAM(state, action) {
      state.inspector = {
        ...state.inspector, isAwaitingMjpegStream: action.isAwaiting
      };
    },

    SHOW_GESTURE_EDITOR(state, action) {
      state.inspector = {
        ...state.inspector,
        isGestureEditorVisible: true,
      };
    },

    HIDE_GESTURE_EDITOR(state, action) {
      state.inspector = {
        ...state.inspector,
        isGestureEditorVisible: false,
      };
    },

    GET_SAVED_GESTURES_REQUESTED(state, action) {
      state.inspector = {
        ...state.inspector,
        getSavedGesturesRequested: true,
      };
    },

    GET_SAVED_GESTURES_DONE(state, action) {
      nextState = {
        ...state,
        savedGestures: action.savedGestures || [],
      };
      state.inspector =
        omit(nextState, 'getSavedGesturesRequested');
    },

    DELETE_SAVED_GESTURES_REQUESTED(state, action) {
      state.inspector = {
        ...state.inspector,
        deleteGesture: action.deleteGesture,
      };
    },

    DELETE_SAVED_GESTURES_DONE(state, action) {
      state.inspector = omit(state, 'deleteGesture');
    },

    SET_LOADED_GESTURE(state, action) {
      state.inspector = {
        ...state.inspector,
        loadedGesture: action.loadedGesture,
      };
    },

    REMOVE_LOADED_GESTURE(state, action) {
      state.inspector = omit(state, 'loadedGesture');
    },

    SHOW_GESTURE_ACTION(state, action) {
      state.inspector = {
        ...state.inspector,
        showGesture: action.showGesture,
      };
    },

    HIDE_GESTURE_ACTION(state, action) {
      state.inspector = omit(state, 'showGesture');
    },

    SELECT_TICK_ELEMENT(state, action) {
      state.inspector = {
        ...state.inspector,
        selectedTick: action.selectedTick,
      };
    },

    UNSELECT_TICK_ELEMENT(state, action) {
      state.inspector = omit(state.inspector, 'selectedTick');
    },

    SET_GESTURE_TAP_COORDS_MODE(state, action) {
      state.inspector = {
        ...state.inspector,
        tickCoordinates: {
          x: action.x,
          y: action.y,
        },
      };
    },

    CLEAR_TAP_COORDINATES(state, action) {
      state.inspector = omit(state, 'tickCoordinates');
    },

    TOGGLE_SHOW_ATTRIBUTES(state, action) {
      state.inspector = {
        ...state.inspector, showSourceAttrs: !state.showSourceAttrs
      };
    },

    TOGGLE_REFRESHING_STATE(state, action) {
      state.inspector = {
        ...state.inspector, isSourceRefreshOn: !state.isSourceRefreshOn
      };
    },
    setDeviceList(state, action) {
      state.inspector = {
        ...state.inspector, devices: action.devices
      };
    },
  },
});


// `createSlice` automatically generated action creators with these names.
// export them as named exports from this "slice" file
export const {setSourceAndScreenshot, quitSessionRequested} = inspectorSlice.actions;

// Export the slice reducer as the default export
export default inspectorSlice.reducer;
