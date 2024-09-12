import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as SessionActions from '../actions/Session';
import * as DevicesActions from '../actions/Devices';
import Session from '../components/Session/Session.jsx';
import {withTranslation} from '../i18next';

function mapStateToProps(state) {
  return state.session;
}


function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(SessionActions, dispatch),
    ...bindActionCreators(DevicesActions, dispatch),
  };
}

export default withTranslation(Session, connect(mapStateToProps, mapDispatchToProps));
