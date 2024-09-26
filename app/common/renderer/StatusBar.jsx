import React from 'react';
import {connect} from 'react-redux';
import {Layout, Space, Typography} from 'antd';
// TODO:
import {
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BranchesOutlined,
  UserOutlined
} from '@ant-design/icons';

import {withTranslation} from './i18next.js';
import {selectorIsAppiumServerRunning, selectorIsTestServerRunning} from './stores/serverSlice';

const StatusBar = (props) => {
  const {selectorIsAppiumServerRunning, selectorIsTestServerRunning} = props;
  const isAppiumServerRunning = useSelector(selectorIsAppiumServerRunning);
  const isTestServerRunning = useSelector(selectorIsTestServerRunning);
  return (
    <Layout.Footer>
      <Space split={<span style={{ margin: '0 8px' }}>|</span>} wrap={false}>
        <Space>
          <Typography.Text>Message......</Typography.Text>
        </Space>
        <Space>
          <CheckCircleOutlined style={{ color: isAppiumServerRunning ? '#52c41a' : '#faad14' }} />
          <Typography.Text>Core Server</Typography.Text>
        </Space>
        <Space>
          <CheckCircleOutlined style={{ color: isTestServerRunning ? '#52c41a' : '#faad14' }} />
          <Typography.Text>Test Server</Typography.Text>
        </Space>
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <Typography.Text>0 warnings</Typography.Text>
        </Space>
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <Typography.Text>0 information</Typography.Text>
        </Space>
        <Space>
          <BranchesOutlined />
          <Typography.Text>main</Typography.Text>
        </Space>
        <Space>
          <UserOutlined />
          <Typography.Text>User</Typography.Text>
        </Space>
      </Space>
    </Layout.Footer>
  );
};

function mapStateToProps(state) {
  return state.session;
}

export default withTranslation(StatusBar, connect(mapStateToProps));
