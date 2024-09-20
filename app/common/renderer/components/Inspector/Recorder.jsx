import React, {useCallback, useMemo, useState} from 'react';
import {
  ClearOutlined,
  CodeOutlined,
  CopyOutlined,
  PicRightOutlined,
  // FormOutlined,
  EditOutlined,
  DeleteOutlined, PlayCircleOutlined, StopOutlined, TagOutlined
} from '@ant-design/icons';
import {Button, Card, Col, Descriptions, Divider, Layout, List, Row, Select, Space, Spin, Table, Tooltip} from 'antd';
import hljs from 'highlight.js';
import {capitalCase, sentenceCase} from 'change-case';

import {BUTTON} from '../../constants/antd-types';
import frameworks from '../../lib/client-frameworks';
import {copyToClipboard, ipcRenderer} from '../../polyfills';
import InspectorStyles from './Inspector.module.css';
import SessionStyles from '../Session/Session.module.css';
import * as PropTypes from 'prop-types';
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

// const MODULO = 1e9 + 7;

const Recorder = (props) => {
  const {showBoilerplate, recordedActions, actionFramework, t, showActionSource} = props;
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
  const getActionName = useCallback(({action, index}) => `${sentenceCase(action)} #${index}`, []);
  const dataSourceActions = useMemo(() => {
    const actionNameIndexes = new Map();
    return recordedActions?.map(({action, params}, index) => {
      const actionNameIndex = actionNameIndexes.get(action) || {action, index: 0};
      actionNameIndex.index += 1;
      actionNameIndexes.set(action, actionNameIndex);
      return {
        // key: (index % MODULO) + '',
        key: index + '',
        type: action,
        name: getActionName(actionNameIndex),
        actions: (index % 2) === 0, // TODO:
        params
      };
    });
  }, [recordedActions.length]); // TODO: find a better way
  /** @type {any[]} */
  const columnsActions = [
    {
      title: t('actionsType'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('actionsName'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('actionsActions'),
      dataIndex: 'actions',
      key: 'actions',
      render: (value, record) => {
        if (value) {
          return (
            <Button.Group>
              <Button
                icon={<EditOutlined />}
                className={SessionStyles.editSession}
                onClick={() => {
                  //
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                onClick={() => {
                  //
                }}
              />
            </Button.Group>
          );
        }
        return null;
      },
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
  const dataSourceProperties = useMemo(() => {
    const data = [];
    if (actionSelect.selectedRowKeys.length === 1) {
      const selectedActionKey = actionSelect.selectedRowKeys[0];
      const dataSourceAction = dataSourceActions.find(({key}) => selectedActionKey === key);
      if (dataSourceAction) {
        const params = dataSourceAction.params;
        switch (dataSourceAction.type) {
          case 'findAndAssign':
            // params[0]; // LOCATOR_STRATEGIES
            // params[1]; // selector
            // params[2]; // variableName
            // params[3]; // isArray (read-only)
            /*switch (params[0]) {
              case LOCATOR_STRATEGIES.ID:
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
              case LOCATOR_STRATEGIES.XPATH:
                break;
            }*/
            data.push(...[
              {
                // type: 'input',
                key: '0',
                name: 'Name',
                values: dataSourceAction.name,
                unit: ''
              },
              {
                // type: 'options',
                key: '1',
                name: 'Strategy',
                values: params[0],
                unit: ''
              },
              {
                // type: 'input',
                key: '2',
                name: 'Selector',
                values: params[1],
                unit: ''
              },
              /*{
                // type: 'input',
                // readOnly: true,
                key: '3',
                name: 'Variable Name',
                values: params[2],
                unit: ''
              },
              {
                // type: 'boolean',
                // readOnly: true,
                key: '4',
                name: 'Is array',
                values: params[3],
                unit: ''
              }*/
            ]);
            return data;
          case 'pressKeyCode':
            // params[0] = variableName // appium-client.js::this.elementCache[elementId], `el${this.elVarCount}` (read-only)
            // params[1] = variableIndex // (read-only)
            data.push(...[
              {
                // type: 'input',
                key: '0',
                name: 'Name',
                values: dataSourceAction.name,
                unit: ''
              },
              {
                // type: input,
                key: '1',
                name: 'key code', // keyCode
                values: params[2],
                unit: ''
              }
            ]);
            if (params.length === 4) {
              data.push({
                // type: input,
                key: '2',
                name: 'meta', // metaState
                values: params[3],
                unit: ''
              });
            }
            if (params.length === 5) {
              data.push({
                // type: input,
                key: '3',
                name: 'flags', // flags
                values: params[4] ?? '',
                unit: ''
              });
            }
            return data;
          case 'swipe':
            // params[0] = variableName // appium-client.js::this.elementCache[elementId], `el${this.elVarCount}` (read-only)
            // params[1] = variableIndex // (read-only)
            // params[2] = {finger1: []}
            // params[2][0] = {type: "pointerMove", duration: 0, x: 190, y: 485}
            // params[2][1] = {type: "pointerDown", button: 0}
            // params[2][0] = {type: "pointerMove", duration: 500, x: 320, y: 485, origin: "mouse|viewport"}
            // params[2][3] = {type: "pointerUp", button: 0}
            data.push({
              // type: 'input',
              key: 'swipe',
              name: 'Name',
              values: dataSourceAction.name,
              unit: '',
            });
            Object.keys(params[2]).forEach((name, index) => {
              const propertyKey = `${name}#${index}`;
              /** @type {{type: string, button?: number; duration?: number; x?: number; y?: number; origin?: string}[]} */
              const fingers = params[2][name];
              /** @type {{key: string; name: string; values: string | number; unit?: string}[]} */
              data.push({
                // type: separator,
                key: name,
                name,
                values: '-----',
                unit: ''
              });
              fingers.forEach((finger, fingerIndex) => {
                data.push({
                  // type: input,
                  // readOnly: true,
                  key: `${propertyKey}#${fingerIndex}}#A`,
                  name: 'Type',
                  values: capitalCase(finger.type),
                  unit: ''
                });
                switch (finger.type) {
                  case 'pointerMove':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#0`,
                      name: 'duration',
                      values: finger.duration,
                      unit: ''
                    });
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#1`,
                      name: 'x',
                      values: finger.x,
                      unit: ''
                    });
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#2`,
                      name: 'y',
                      values: finger.y,
                      unit: ''
                    });
                    data.push({
                      // type: input,
                      key: `${propertyKey}#${fingerIndex}#3`,
                      name: 'origin',
                      values: finger.origin ?? 'viewport', // 'viewport' | '?'
                      unit: ''
                    });
                    break;
                  case 'pointerDown':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#4`,
                      name: 'button',
                      values: finger.button ?? 0,
                      unit: ''
                    });
                    break;
                  case 'pause':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#5`,
                      name: 'duration',
                      values: finger.duration ?? 0,
                      unit: ''
                    });
                    break;
                }
              });
            });
            return data;
          case 'tap': {
            // params[0] = variableName // appium-client.js::this.elementCache[elementId], `el${this.elVarCount}` (read-only)
            // params[1] = variableIndex // (read-only)
            // params[2] = {finger1: []}
            // params[2][0] = {type: "pointerMove", duration: 0, x: 190, y: 485, origin: "mouse|viewport"}
            // params[2][1] = {type: "pointerDown", button: 0}
            // params[2][2] = {type: "pause", duration: 100}
            // params[2][3] = {type: "pointerUp", button: 0}
            data.push({
              // type: 'input',
              key: 'tap',
              name: 'Name',
              values: dataSourceAction.name,
              unit: ''
            });
            Object.keys(params[2]).forEach((name, index) => {
              const propertyKey = `${name}#${index}`;
              /** @type {{type: string, button?: number; duration?: number; x?: number; y?: number;}[]} */
              const fingers = params[2][name];
              /** @type {{key: string; name: string; values: string | number; unit?: string}[]} */
              data.push({
                // type: separator,
                // key: propertyKey,
                key: name,
                name,
                values: '-----',
                unit: ''
              });
              fingers.forEach((finger, fingerIndex) => {
                data.push({
                  // type: input,
                  // readOnly: true,
                  key: `${propertyKey}#${fingerIndex}}#A`,
                  name: 'Type',
                  values: capitalCase(finger.type),
                  unit: ''
                });
                switch (finger.type) {
                  case 'pointerMove':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}}#0`,
                      name: 'duration',
                      values: finger.duration,
                      unit: ''
                    });
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#1`,
                      name: 'x',
                      values: finger.x,
                      unit: ''
                    });
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#2`,
                      name: 'y',
                      values: finger.y,
                      unit: ''
                    });
                    break;
                  case 'pointerDown':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#3`,
                      name: 'button',
                      values: finger.button ?? 0,
                      unit: ''
                    });
                    break;
                  case 'pause':
                    data.push({
                      // type: number,
                      key: `${propertyKey}#${fingerIndex}#4`,
                      name: 'duration',
                      values: finger.duration ?? 0,
                      unit: ''
                    });
                    break;
                }
              });
            });
            return data;
          }
        }
      }
      return data;
    }
    return data;
  }, [actionSelect.selectedRowKeys?.[0], dataSourceActions.length]);
  /** @type {any[]} */
  const columnsProperties = [
    {
      title: t('actionPropName'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('actionPropValues'),
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
  const [isActionsPlayed, setIsActionsPlayed] = useState(false);

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

  const actionCode = () => {
    const {host, port, path, https, desiredCapabilities} = props.sessionDetails;

    // const framework = new frameworks[actionFramework](host, port, path, https, desiredCapabilities);
    // eslint-disable-next-line dot-notation
    const framework = new frameworks['javaJUnit5'](host, port, path, https, desiredCapabilities);
    framework.actions = recordedActions;
    let str = '';
    let code;
    let index = 0;
    for (let {action, params} of framework.actions) {
      const actionId = dataSourceActions[index].key;
      const funcName = `codeFor_${action}`;
      if (framework[funcName]) {
        code = `try {
          System.out.println("START[${actionId}]: '${action}'");
          ${framework[funcName](...params)}
          System.out.println("END[${actionId}]: '${action}'");
        } catch (Exception e) {
            System.out.println("ERROR[${actionId}]: failed to run action '${action}': " + e.getMessage());
            throw new Exception();
        }`;
      } else {
        code = `// Code generation for action '${action}' is not currently supported`;
      }
      str += `${code}\n`;
    }
    return str;
  };

  const onStartTesting = useCallback(() => {
    setIsActionsPlayed(true);
    log.debug('[renderer] starting test....');
    ipcRenderer.send('start-test', {
      // NOTE: read from device info
      targetVersion: 12,
      codes: actionCode() || 'var a = 3;',
      capabilities: {
        deviceName: 'emulator-5554',
        app: 'apps/Android-MyDemoAppRN.1.3.0.build-244.apk',
        appPackage: 'com.saucelabs.mydemoapp.rn',
        appActivity: '.MainActivity',
      },
      remoteAddress: 'http://localhost:8000', // 'host:port'
    });
  }, [recordedActions?.length > 0]);

  const onStopTesting = useCallback(() => {
    setIsActionsPlayed(false);
    log.debug('[renderer] stopping test....');
    ipcRenderer.send('stop-test');
  }, []);

  const actionBar = () => {
    const {setActionFramework, toggleShowBoilerplate, clearRecording, toggleShowActionSource} = props;

    return (
      <Space size="middle">
        {showActionSource ? (
          <>
            {!!recordedActions.length && (
              <Button.Group>
                <Tooltip title={t('Show/Hide Boilerplate Code')}>
                  <Button
                    onClick={toggleShowBoilerplate}
                    icon={<PicRightOutlined />}
                    type={showBoilerplate ? BUTTON.PRIMARY : BUTTON.DEFAULT}
                  />
                </Tooltip>
                <Tooltip title={t('Copy code to clipboard')}>
                  <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(code())} />
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
            </Select>
            <Divider type="vertical" />
          </>
        ) : (
          <>
            {!!recordedActions.length && (
              <>
                <Button.Group>
                  <Tooltip title={t('startTesting')}>
                    <Button
                      onClick={onStartTesting}
                      icon={<PlayCircleOutlined />}
                      type={BUTTON.DEFAULT}
                      disabled={(recordedActions.length === 0) || isActionsPlayed}
                    />
                  </Tooltip>
                  <Tooltip title={t('stopTesting')}>
                    <Button
                      onClick={onStopTesting}
                      icon={<StopOutlined />}
                      type={BUTTON.DEFAULT}
                      disabled={(recordedActions.length === 0) || (!isActionsPlayed)}
                    />
                  </Tooltip>
                </Button.Group>
                <Divider type="vertical" />
              </>
            )}
          </>
        )}
        <Tooltip title={t('showActionSource')}>
          <Button
            onClick={toggleShowActionSource}
            icon={<PicRightOutlined />}
            type={showActionSource ? BUTTON.PRIMARY : BUTTON.DEFAULT}
          />
        </Tooltip>
      </Space>
    );
  };

  const onActionsTableRow = (record, rowIndex) => {
    // log.log('onActionsTableRow', record, rowIndex);
    return {
      onClick: (event) => {
        setActionSelect((prevActionSelect) => {
          log.log('onActionsTableRowClick', event, record, rowIndex);
          /*if (record.key !== actionSelect?.key) {
            // TODO: 수정된 사항이 있는 경우, 적용할지 여부를 물어보자!
            // const dataSource = dataSourceActions[rowIndex];
            setActionSelect({
              ...actionSelect,
              selectedRowKeys: [record.key]
            });
            /!*setPropertiesSelect({
              ...propertiesSelect,
              loading: true,
            });*!/
          } else {
            setActionSelect({
              ...actionSelect,
              selectedRowKeys: [record.key]
            });
            /!*setPropertiesSelect({
              ...propertiesSelect,
              loading: false,
            });*!/
          }*/
          if (record.key !== prevActionSelect.key) {
            return {
              ...prevActionSelect,
              selectedRowKeys: [record.key],
            };
          }
        });
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
    <div id="recorder" className="action-row">
      <div className="action-col">
        <Card
          title={
            <span>
              <CodeOutlined /> {t('Recorder')}
            </span>
          }
          className={InspectorStyles['interaction-tab-card']}
          extra={actionBar()}
        >
          {showActionSource ? (!recordedActions.length ? (
              <div className={InspectorStyles['no-recorded-actions']}>
                {t('enableRecordingAndPerformActions')}
              </div>
            ) : (
              <pre className={InspectorStyles['recorded-code']}>
                <code dangerouslySetInnerHTML={{__html: code(false)}} />
              </pre>
            )
          ) : (
            <Table
              columns={columnsActions}
              dataSource={dataSourceActions}
              size="small"
              scroll={{x: 'max-content'}}
              pagination={false}
              /*rowSelection={{
                /!*type: 'radio',
                getCheckboxProps: (_record) => {
                  return {
                    style: {
                      display: 'none',
                    },
                  };
                },*!/
                renderCell() {
                  // .ant-table-selection-column { display: none; } 필요
                  return null;
                },
                selectedRowKeys: actionSelect.selectedRowKeys
              }}*/
              onRow={onActionsTableRow}
            />
          )}
        </Card>
      </div>
      <div
        id="selectedElementContainer"
        className={`${InspectorStyles['interaction-tab-container']} ${InspectorStyles['element-detail-container'] ?? ''} action-col`}
      >
        <Card
          title={
            <span>
              <TagOutlined /> {t('selectedElement')}
            </span>
          }
          className={InspectorStyles['selected-element-card']}
        >
          <Table
            columns={columnsProperties}
            dataSource={dataSourceProperties}
            size="small"
            scroll={{x: 'max-content'}}
            pagination={false}
            onRow={onPropertiesTableRow}
          />
          {/* <Divider />
          <Descriptions title={t('properties')} size="small" bordered column="sm">
            <Descriptions.Item span={3} label={t('propertiesDescription')}>{'Desc'}</Descriptions.Item>
            <Descriptions.Item span={3} label={t('propertiesX')}>{'X'}</Descriptions.Item>
            <Descriptions.Item span={3} label={t('propertiesY')}>{'Y'}</Descriptions.Item>
            <Descriptions.Item span={3} label={t('propertiesType')}>{'Type'}</Descriptions.Item>
          </Descriptions> */}
        </Card>
      </div>
    </div>
  );
};

export default Recorder;
