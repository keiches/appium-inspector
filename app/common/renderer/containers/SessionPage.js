import {connect} from 'react-redux';
// import {bindActionCreators} from 'redux';

import * as SessionActions from '../actions/Session';
import Session from '../components/Session/Session.jsx';
import {withTranslation} from '../i18next';
// import * as ApplicationsActions from '../actions/Applications';
import {
  addApplication,
  clearApplications,
  deleteApplication,
  readApplications,
  resetApplications,
  selectApplication,
  selectorApplications,
  selectorIsReading as selectorIsApplicationsReading,
  selectorSelectedApplication,
} from '../stores/applicationsSlice';
// import * as DevicesActions from '../actions/Devices';
import {
  addDevice,
  clearDevices,
  deleteDevice,
  readDevices,
  resetDevices,
  selectDevice,
  selectorDevices,
  selectorIsReading as selectorIsDevicesReading,
  selectorSelectedDevice,
} from '../stores/devicesSlice';
import {
  setAppiumServerRunning,
  setTestServerRunning,
  setTesting,
  selectorIsAppiumServerRunning,
  selectorIsTestServerRunning,
  selectorIsTesting,
} from '../stores/serverSlice';

function mapStateToProps(state) {
  return {
    ...state.session,
    isAppiumServerRunning: selectorIsAppiumServerRunning(state),
    isTestServerRunning: selectorIsTestServerRunning(state),
    isTesting: selectorIsTesting(state),
    // devices: state.devices.items,
    // selectedDevice: state.devices.selected,
    devices: selectorDevices(state),
    selectedDevice: selectorSelectedDevice(state),
    isDevicesReading: selectorIsDevicesReading(state),
    applications: selectorApplications(state),
    selectedApplication: selectorSelectedApplication(state),
    isApplicationsReading: selectorIsApplicationsReading(state),
  };
}

/*
function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(SessionActions, dispatch),
    // ...SessionActions,
    // ...bindActionCreators(DevicesActions, dispatch),
    ...bindActionCreators({
      // for Devices
      readDevices,
      resetDevices,
      clearDevices,
      selectDevice,
      addDevice,
      deleteDevice,
      // for Applications
      readApplications,
      resetApplications,
      clearApplications,
      selectApplication,
      addApplication,
      deleteApplication
    }, dispatch),
  };
}

export default withTranslation(Session, connect(mapStateToProps, mapDispatchToProps));
*/
export default withTranslation(Session, connect(mapStateToProps, {
  ...SessionActions,
  // for Server
  setAppiumServerRunning,
  setTestServerRunning,
  setTesting,
  // for Devices
  readDevices,
  resetDevices,
  clearDevices,
  selectDevice,
  addDevice,
  deleteDevice,
  // for Applications
  readApplications,
  resetApplications,
  clearApplications,
  selectApplication,
  addApplication,
  deleteApplication
}));
