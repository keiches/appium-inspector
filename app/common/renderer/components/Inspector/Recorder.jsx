import {
  ClearOutlined,
  CodeOutlined,
  CopyOutlined,
  PicRightOutlined,
  FormOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import {Button, Card, Col, Descriptions, Divider, Layout, List, Row, Select, Space, Spin, Table, Tooltip} from 'antd';
import hljs from 'highlight.js';
import React, {useCallback, useMemo, useState} from 'react';
import {sentenceCase} from 'change-case';

import {BUTTON} from '../../constants/antd-types';
import frameworks from '../../lib/client-frameworks';
import {clipboard} from '../../polyfills';
import InspectorStyles from './Inspector.module.css';
import SessionStyles from '../Session/Session.module.css';
import * as PropTypes from 'prop-types';
import Sider from 'antd/lib/layout/Sider';
import {log} from '../../utils/logger';

/** @type {React.CSSProperties} */
const contentStyle = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  // color: '#fff',
  backgroundColor: '#fff'
};

/** @type {React.CSSProperties} */
const siderStyle = {
  textAlign: 'center',
  lineHeight: '120px',
  // color: '#fff',
  backgroundColor: '#fff'
};

const spaceContainer = {
  display: 'flex',
  'wordBreak': 'break-word'
};


function Flex(props) {
  return null;
}

Flex.propTypes = {children: PropTypes.node};

const MODULO = 1e9 + 7;

const Recorder = (props) => {
  const {showBoilerplate, showSourceActions, recordedActions, actionFramework, t} = props;
  // actions panel
  const [actionSelect, setActionSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });

  const [propertiesSelect, setPropertiesSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });

  /*const actionNameIndexes = useMemo(() => {
    return new Map();
  }, []);*/
  /**
   *
   * @type {function({action: string, index: number})} callback
   */
  const getActionName = useCallback(({action, index}) => {
    return `${sentenceCase(action)} #${index}`;
  }, []);
  const dataSourceActions = useMemo(() => {
    const actionNameIndexes = new Map();
    return recordedActions?.map(({action, params}, index) => {
      const actionNameIndex = actionNameIndexes.get(action) || {action, index: 0};
      actionNameIndex.index += 1;
      actionNameIndexes.set(action, actionNameIndex);
      return {
        key: (index % MODULO) + '',
        name: getActionName(actionNameIndex),
        type: '',
        status: 'Ready',
        params
      };
    });
  }, [recordedActions.length]); // TODO: find a better way
  /** @type {any[]} */
  const columnsActions = [
    {
      title: 'Type', // t('Type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status'
    }
    /*{
      title: 'Actions',
      key: 'actions',
      // width: SESSION_INFO_TABLE_PARAMS.COLUMN_WIDTH,
      render: ({name, icon}, record) => (
        <Button.Group>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              //
            }}
            className={SessionStyles.editSession}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              //
            }}
          />
        </Button.Group>
      ),
    },*/
  ];
  // properties panel
  const dataSourceProperties0 = [
    {
      key: '1',
      name: 'X',
      values: '100.0',
      unit: 'pt'
    },
    {
      key: '2',
      name: 'Y',
      values: '220.0',
      unit: 'pt'
    },
    {
      key: '3',
      name: 'Wait',
      values: '1000',
      unit: 'ms'
    }
  ];
  const dataSourceProperties = useMemo(() => {
    if (actionSelect.selectedRowKeys.length === 1) {
      const selectedActionKey = actionSelect.selectedRowKeys[0];
      const dataSourceAction = dataSourceActions.find(({key}) => selectedActionKey === key);
      if (dataSourceAction) {
        let data;
        const params = dataSourceAction.params;
        switch (dataSourceAction.action) {
          case 'findAndAssign':
            // TODO: 찾는 방법에 따라 값이 다름
            switch (params[0]) {
              case 'id':
                // params[0]; // 찾는 방법?
                // params[1]; // 찾을 값
                // params[2]; // TODO: 뭔지 모름
                // params[3]; // TODO: 뭔지 모름
                data = [
                  {
                    key: '1',
                    name: 'id',
                    values: params[1],
                    unit: ''
                  },
                  {
                    key: '2',
                    name: 'unknown1',
                    values: params[2],
                    unit: ''
                  },
                  {
                    key: '3',
                    name: 'unknown2',
                    values: params[3],
                    unit: ''
                  }
                ];
                break;
            }
            return data;
          case 'pressKeyCode':
            // params[0]; // TODO: 뭔지 모름
            // params[1]; // TODO: 뭔지 모름
            data = [
              {
                key: '1',
                name: 'key code',
                values: params[2],
                unit: ''
              }
            ];
            if (params.length === 4) {
              data.push(
                {
                  key: '2',
                  name: 'meta',
                  values: params[3],
                  unit: ''
                });
            }
            if (params.length === 5) {
              data.push(
                {
                  key: '3',
                  name: 'custom',
                  values: params[4] ?? '',
                  unit: ''
                });
            }
            return data;
          case 'swipe':
            // params[0]; // TODO: 뭔지 모름
            // params[1]; // TODO: 뭔지 모름
            // params[2] = {finger1: []}
            // params[2][0] = {type: "pointerMove", duration: 0, x: 190, y: 485}
            // params[2][1] = {type: "pointerDown", button: 0}
            // params[2][0] = {type: "pointerMove", duration: 500, x: 320, y: 485, origin: "mouse|viewport"}
            // params[2][3] = {type: "pointerUp", button: 0}
            data = Object.keys(params[2]).map((name) => {
              /** @type {{type: string, button?: number; duration?: number; x?: number; y?: number; origin?: string}[]} */
              const fingers = params[2][name];
              /** @type {{key: string; name: string; values: string | number; unit?: string}[]} */
              const properties = [
                // TODO: properties에 list 처리 기능 필요
                //!--
                {
                  key: '0',
                  name,
                  values: '-----',
                  unit: ''
                }
              ];
              fingers.forEach((finger) => {
                switch (finger.type) {
                  case 'pointerMove':
                    properties.push({
                      key: '11',
                      name: 'duration',
                      values: finger.duration,
                      unit: ''
                    });
                    properties.push({
                      key: '12',
                      name: 'x',
                      values: finger.x,
                      unit: ''
                    });
                    properties.push({
                      key: '13',
                      name: 'y',
                      values: finger.y,
                      unit: ''
                    });
                    properties.push({
                      key: '14',
                      name: 'origin',
                      values: finger.origin ?? 'viewport', // 'viewport' | '?'
                      unit: ''
                    });
                    break;
                  case 'pointerDown':
                    properties.push({
                      key: '1',
                      name: 'button',
                      values: finger.button ?? 0,
                      unit: ''
                    });
                    break;
                  case 'pause':
                    properties.push({
                      key: '1',
                      name: 'duration',
                      values: finger.duration ?? 0,
                      unit: ''
                    });
                    break;
                }
              });
              return properties;
            });
            return data;
          case 'tap':
            // params[0]; // TODO: 뭔지 모름
            // params[1]; // TODO: 뭔지 모름
            // params[2] = {finger1: []}
            // params[2][0] = {type: "pointerMove", duration: 0, x: 190, y: 485, origin: "mouse|viewport"}
            // params[2][1] = {type: "pointerDown", button: 0}
            // params[2][2] = {type: "pause", duration: 100}
            // params[2][3] = {type: "pointerUp", button: 0}
            data = Object.keys(params[2]).map((name) => {
              /** @type {{type: string, button?: number; duration?: number; x?: number; y?: number;}} */
              const finger = params[2][name];
              /** @type {{key: string; name: string; values: string | number; unit?: string}[]} */
              const properties = [
                // TODO: properties에 list 처리 기능 필요
                //!--
                {
                  key: '0',
                  name,
                  values: '-----',
                  unit: ''
                }
                //--
              ];
              switch (finger.type) {
                case 'pointerMove':
                  properties.push({
                    key: '1',
                    name: 'duration',
                    values: finger.duration,
                    unit: ''
                  });
                  properties.push({
                    key: '2',
                    name: 'x',
                    values: finger.x,
                    unit: ''
                  });
                  properties.push({
                    key: '3',
                    name: 'y',
                    values: finger.y,
                    unit: ''
                  });
                  break;
                case 'pointerDown':
                  properties.push({
                    key: '1',
                    name: 'button',
                    values: finger.button ?? 0,
                    unit: ''
                  });
                  break;
                case 'pause':
                  properties.push({
                    key: '1',
                    name: 'duration',
                    values: finger.duration ?? 0,
                    unit: ''
                  });
                  break;
              }
              return properties;
            });
            return data;
        }
      }
      return [];
    }
    return [];
  }, [actionSelect.selectedRowKeys?.[0], dataSourceActions.length]);
  /** @type {any[]} */
  const columnsProperties = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Values',
      dataIndex: 'values',
      // colSpan: 2,
      key: 'values'
    },
    {
      title: ' ',
      dataIndex: 'unit',
      key: 'unit'
    }
  ];

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

  const onActionsTableRow = (record, rowIndex) => {
    log.log('onActionsTableRow', record, rowIndex);
    return {
      onClick: (event) => {
        log.log('onActionsTableRowClick', event, record, rowIndex);
        if (record.key !== actionSelect?.key) {
          // TODO: 수정된 사항이 있는 경우, 적용할지 여부를 물어보자!
          // const dataSource = dataSourceActions[rowIndex];
          setActionSelect({
            ...actionSelect,
            selectedRowKeys: [record.key]
          });
          /*setPropertiesSelect({
            ...propertiesSelect,
            loading: true,
          });*/
        } else {
          setActionSelect({
            ...actionSelect,
            selectedRowKeys: [record.key]
          });
          /*setPropertiesSelect({
            ...propertiesSelect,
            loading: false,
          });*/
        }
      }
    };
  };

  const onPropertiesTableRow = (record, rowIndex) => {
    log.log('onPropertiesTableRow', record, rowIndex);
    return {
      onClick: (event) => {
        /*if (record.key !== propertiesSelect?.key) {
          setPropertiesSelect({
            ...propertiesSelect,
            selectedRowKeys: [record.key],
          });
        } else {
          setPropertiesSelect({
            ...propertiesSelect,
            selectedRowKeys: [record.key],
          });
        }*/
      }
    };
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
        <Space className={InspectorStyles.spaceContainer} direction="vertical" size="middle">
          <Layout hasSider>
            <Layout.Content style={contentStyle}>
              <Table
                columns={columnsActions}
                dataSource={dataSourceActions}
                size="small"
                scroll={{x: 'max-content'}}
                pagination={false}
                rowSelection={{
                  /*type: 'radio',
                  getCheckboxProps: (_record) => {
                    return {
                      style: {
                        display: 'none',
                      },
                    };
                  },*/
                  renderCell() {
                    // .ant-table-selection-column { display: none; } 필요
                    return null;
                  },
                  selectedRowKeys: actionSelect.selectedRowKeys
                }}
                onRow={onActionsTableRow}
              />
            </Layout.Content>
            <Sider style={siderStyle} collapsible={false} width="25%">
              <Table
                columns={columnsProperties}
                dataSource={dataSourceProperties}
                size="small"
                scroll={{x: 'max-content'}}
                pagination={false}
                onRow={onPropertiesTableRow}
              />
              <Divider />
              <Descriptions title="Properties" layout={'vertical'} size={'small'}>
                <Descriptions.Item label={t('propDescDescription')}>{'Desc'}</Descriptions.Item>
                <Descriptions.Item label={t('propDescX')}>{'X'}</Descriptions.Item>
                <Descriptions.Item label={t('propDescY')}>{'Y'}</Descriptions.Item>
                <Descriptions.Item label={t('propDescType')}>{'Type'}</Descriptions.Item>
              </Descriptions>
            </Sider>
          </Layout>
        </Space>
      )}
    </Card>
  );
};

export default Recorder;
