import {ReloadOutlined} from '@ant-design/icons';
import {Button, Card, Col, Form, Row, Select} from 'antd';
import React from 'react';

import {ServerTypes} from '../../actions/Session';
import SessionStyles from './Session.module.css';

const formatCaps = (caps) => {
  let importantCaps = [caps.app, caps.platformName, caps.deviceName];
  if (caps.automationName) {
    importantCaps.push(caps.automationName);
  }
  return importantCaps.join(', ').trim();
};

const formatCapsBrowserstack = (caps) => {
  let importantCaps = formatCaps(caps).split(', ');
  if (caps.sessionName) {
    importantCaps.push(caps.sessionName);
  }
  return importantCaps.join(', ').trim();
};

const formatCapsLambdaTest = (caps) => {
  if (caps.hasOwnProperty.call(caps, 'capabilities')) {
    caps = caps.capabilities;
  }
  const deviceName = caps.desired ? caps.desired.deviceName : caps.deviceName;
  const importantCaps = [deviceName, caps.platformName, caps.platformVersion];
  return importantCaps.join(', ').trim();
};

const getSessionInfo = (session, serverType) => {
  switch (serverType) {
    case ServerTypes.browserstack:
      return `${session.id} — ${formatCapsBrowserstack(session.capabilities)}`;
    case ServerTypes.lambdatest:
      return `${session.id} - ${formatCapsLambdaTest(session.capabilities)}`;
    default:
      return `${session.id} — ${formatCaps(session.capabilities)}`;
  }
};

const SessionHelper = (props) => {
  const {
    serverType,
    attachSessId,
    t,
  } = props;
  return (
    <Row className={SessionStyles.sessionHelper}>
      <Col span={8}>
        <Card>
          <p className={SessionStyles.localDesc}>
            {t('connectToExistingSessionInstructions')}
            <br />
            {t('selectSessionIDInDropdown')}
          </p>
        </Card>
      </Col>
      <Col span={16}>
        <Row>
          <Col span={24}>
            <p className={SessionStyles.localDesc}>
              {serverType}
              <br />
              {attachSessId}
            </p>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default SessionHelper;
