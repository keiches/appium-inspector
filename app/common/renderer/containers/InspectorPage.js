import {connect} from 'react-redux';

import * as InspectorActions from '../actions/Inspector';
import Inspector from '../components/Inspector/Inspector.jsx';
import {withTranslation} from '../i18next';
import {setAppiumServerRunning, setIsTesting, setTestServerRunning} from '../stores/serverSlice.js';

function mapStateToProps(state) {
  return state.inspector;
}

export default withTranslation(Inspector, connect(mapStateToProps, {
  ...InspectorActions,
  // for Server
  setAppiumServerRunning,
  setTestServerRunning,
  setIsTesting,
}));
