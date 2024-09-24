import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as SessionActions from '../actions/Session';
// import * as DevicesActions from '../actions/Devices';
import {
  selectorDevices,
  selectorSelectedDevice,
  selectorIsReading as selectorIsDevicesReading,
  readDevices,
  resetDevices,
  clearDevices,
  selectDevice,
  addDevice,
  deleteDevice,
} from '../stores/devicesSlice';
// import * as ApplicationsActions from '../actions/Applications';
import {
  selectorApplications,
  selectorSelectedApplication,
  selectorIsReading as selectorIsApplicationsReading,
  readApplications,
  resetApplications,
  clearApplications,
  selectApplication,
  addApplication,
  deleteApplication,
} from '../stores/applicationsSlice';
import Session from '../components/Session/Session.jsx';
import {withTranslation} from '../i18next';

function mapStateToProps(state) {
  return {
    ...state.session,
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

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(SessionActions, dispatch),
    // ...bindActionCreators(DevicesActions, dispatch),
    // devicesActions: bindActionCreators({
    ...bindActionCreators({
      readDevices,
      resetDevices,
      clearDevices,
      selectDevice,
      addDevice,
      deleteDevice
    }, dispatch),
    // ...bindActionCreators(ApplicationsActions, dispatch),
    // applicationsActions: bindActionCreators({
    ...bindActionCreators({
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
