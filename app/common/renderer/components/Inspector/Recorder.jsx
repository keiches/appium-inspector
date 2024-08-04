import {
  ClearOutlined,
  CodeOutlined,
  CopyOutlined,
  PicRightOutlined,
  FormOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Descriptions, Divider, Layout, List, Row, Select, Space, Spin, Table, Tooltip} from 'antd';
import hljs from 'highlight.js';
import React, {useState} from 'react';

import {BUTTON} from '../../constants/antd-types';
import frameworks from '../../lib/client-frameworks';
import {clipboard} from '../../polyfills';
import InspectorStyles from './Inspector.module.css';
import SessionStyles from '../Session/Session.module.css';
import {Content} from 'antd/es/layout/layout';
import * as PropTypes from 'prop-types';
import Sider from 'antd/es/layout/Sider';

function Flex(props) {
  return null;
}

Flex.propTypes = {children: PropTypes.node};
const Recorder = (props) => {
  const {showBoilerplate, showSourceActions, recordedActions, actionFramework, t} = props;
  // actions panel
  const dataSourceActions = [
    {
      key: '1',
      name: 'Action #1',
      type: 'tap',
      status: 'Ready',
    },
    {
      key: '2',
      name: 'Swipe to right',
      type: 'swipe',
      status: 'Ready',
    },
    {
      key: '3',
      name: 'Tap Login Button',
      type: 'tap',
      status: 'Ready',
    },
    {
      key: '4',
      name: 'Swipe to left',
      type: 'swipe',
      status: 'Ready',
    },
    {
      key: '5',
      name: 'Double Taps',
      type: 'tap',
      status: 'Ready',
    },
  ];
  /** @type {any[]} */
  const columnsActions = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
    },
  ];
  // properties panel
  const dataSourceProperties = [
    {
      key: '1',
      name: 'X',
      value: '100.0',
      unit: 'pt'
    },
    {
      key: '2',
      name: 'Y',
      value: '220.0',
      unit: 'pt'
    },
    {
      key: '3',
      name: 'Wait',
      value: '1000',
      unit: 'ms',
    },
  ];
  /** @type {any[]} */
  const columnsProperties = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Values',
      dataIndex: 'values',
      colSpan: 2,
      key: 'values',
    },
  ];

  const [actionSelect, setActionSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });

  const [propertiesSelect, setPropertiesSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });

  const code = (raw = true) => {
    const {host, port, path, https, desiredCapabilities} = props.sessionDetails;

    let framework = new frameworks[actionFramework](host, port, path, https, desiredCapabilities);
    framework.actions = recordedActions;
    const rawCode = framework.getCodeString(showBoilerplate);
    if (raw) {
      return rawCode;
    }
    return hljs.highlight(rawCode, {language: framework.language}).value;
  };

  const actionBar = () => {
    const {setActionFramework, toggleShowBoilerplate, toggleShowSourceActions, clearRecording} = props;

    return (
      <Space size="middle">
        <Tooltip title={t('Show/Hide Source Actions')}>
          <Button
            onClick={toggleShowSourceActions}
            icon={<FormOutlined />}
            type={showSourceActions ? BUTTON.PRIMARY : BUTTON.DEFAULT}
          />
        </Tooltip>
        {showSourceActions && (<>{!!recordedActions.length && (
          <Button.Group>
            <Tooltip title={t('Show/Hide Boilerplate Code')}>
              <Button
                onClick={toggleShowBoilerplate}
                icon={<PicRightOutlined />}
                type={showBoilerplate ? BUTTON.PRIMARY : BUTTON.DEFAULT}
              />
            </Tooltip>
            <Tooltip title={t('Copy code to clipboard')}>
              <Button icon={<CopyOutlined />} onClick={() => clipboard.writeText(code())} />
            </Tooltip>
            <Tooltip title={t('Clear Actions')}>
              <Button icon={<ClearOutlined />} onClick={clearRecording} />
            </Tooltip>
          </Button.Group>
        )}
          <Select
            defaultValue={actionFramework}
            onChange={setActionFramework}
            className={InspectorStyles['framework-dropdown']}
          >
            {Object.keys(frameworks).map((f) => (
              <Select.Option value={f} key={f}>
                {frameworks[f].readableName}
              </Select.Option>
            ))}
          </Select></>)}
      </Space>
    );
  };

  const onActionsRowClick = (_event, record, rowIndex) => {
    if (record.key !== actionSelect?.key) {
      // TODO: 수정된 사항이 있는 경우, 적용할지 여부를 물어보자!
      // const dataSource = dataSourceActions[rowIndex];
      setActionSelect({
        ...actionSelect,
        selectedRowKeys: [record.key],
      });
    } else {
      setActionSelect({
        ...actionSelect,
        selectedRowKeys: [record.key],
      });
    }
  };

  const onPropertiesRowClick = (_event, record, _rowIndex) => {
    if (record.key !== actionSelect?.key) {
      setActionSelect({
        ...actionSelect,
        selectedRowKeys: [record.key],
      });
    } else {
      setActionSelect({
        ...actionSelect,
        selectedRowKeys: [record.key],
      });
    }
  };

  return (
    <Card
      title={
        <span>
          <CodeOutlined /> {t('Recorder')}
        </span>
      }
      className={InspectorStyles['interaction-tab-card']}
      extra={actionBar()}
    >
      {!recordedActions.length && (
        <div className={InspectorStyles['no-recorded-actions']}>
          {t('enableRecordingAndPerformActions')}
        </div>
      )}
      {showSourceActions ? (
        <>
          {!!recordedActions.length && (
            <pre className={InspectorStyles['recorded-code']}>
              <code dangerouslySetInnerHTML={{__html: code(false)}} />
            </pre>
          )}
        </>) : (
        <Spin spinning={false}>
          <Layout>
            <Content>
              <Table
                columns={columnsActions}
                dataSource={dataSourceActions}
                size="small"
                scroll={{x: 'max-content'}}
                pagination={false}
                onRow={(record, rowIndex) => ({
                  onClick: (event) => onActionsRowClick(event, record, rowIndex),
                })}
              />
            </Content>
            <Sider style={{background: 'white'}} collapsible={false} width="25%">
              <Table
                columns={columnsProperties}
                dataSource={dataSourceProperties}
                size="small"
                scroll={{x: 'max-content'}}
                pagination={false}
                onRow={(record, rowIndex) => ({
                  onClick: (event) => onPropertiesRowClick(event, record, rowIndex),
                })}
              />
              <Divider />
              <Descriptions title="Properties" layout={'vertical'} size={'small'}>
                <Descriptions.Item label="X">Test</Descriptions.Item>
                <Descriptions.Item label="Y">1810000000</Descriptions.Item>
                <Descriptions.Item label="Live">asdf asdf3g</Descriptions.Item>
                <Descriptions.Item label="Remark">empty</Descriptions.Item>
                <Descriptions.Item label="Address">
                  No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
                </Descriptions.Item>
              </Descriptions>
            </Sider>
          </Layout>
        </Spin>
      )}
    </Card>
  );
};

export default Recorder;
