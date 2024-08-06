import React, {useEffect, useRef, useState} from 'react';
import {
  MobileOutlined, ReloadOutlined, AndroidOutlined, AppleOutlined,
  DownloadOutlined, ShakeOutlined, StopOutlined, DeleteOutlined, // ResetOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Form, List, Menu, Row, Select, Table} from 'antd';

import {ServerTypes} from '../../actions/Session';
import SessionStyles from './Session.module.css';
import InspectorStyles from '../Inspector/Inspector.module.css';
import {Header} from 'antd/es/layout/layout';
import {log} from '../../utils/logger';

/**
 * @param {import('@wdio/utils/node_modules/@wdio/types/build').Capabilities.AppiumCapabilities} caps
 * @returns {string}
 */
const formatCaps = (caps) => {
  let importantCaps = [caps.app, caps.platformName, caps.deviceName];
  if (caps.automationName) {
    importantCaps.push(caps.automationName);
  }
  return importantCaps.join(', ').trim();
};

/**
 * @param {import('@wdio/utils/node_modules/@wdio/types/build').Capabilities.BrowserStackCapabilities} caps
 * @returns {string}
 */
const formatCapsBrowserstack = (caps) => {
  let importantCaps = formatCaps(caps).split(', ');
  if (caps.sessionName) {
    importantCaps.push(caps.sessionName);
  }
  return importantCaps.join(', ').trim();
};

/**
 * @param {import('@wdio/utils/node_modules/@wdio/types/build').Capabilities.BrowserStackCapabilities} caps
 * @returns {string}
 */
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

const defaultCapabilities = {
  // "platformName": "Android",
  // "appium:platformVersion": "12.0",
  'appium:automationName': 'uiautomator2',
  // "appium:deviceName": "emulator-5554",
  'appium:noReset': true,
  'appium:printPageSourceOnFindFailure': true,
  // "appium:udid": "emulator-5554",
  // "appium:appPackage": "com.saucelabs.mydemoapp.rn",
  // "appium:app": "\"C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk\"",
  // "appium:appActivity": ".MainActivity"
};

const SessionHelper = (props) => {
  const {
    serverType,
    attachSessId,
    devices: currentDevices,
    t,
  } = props;

  /** @type {Parameters<typeof Table>[0]['ref']} */
  const devicesTblRef = useRef(null);
  /** @type {Parameters<typeof Table>[0]['ref']} */
  const applicationsTblRef = useRef(null);
  const [capabilities, setCapabilities] = useState({...defaultCapabilities});
  const [deviceSelect, setDeviceSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });
  const [applicationSelect, setApplicationSelect] = useState({
    selectedRowKeys: [],
    loading: false
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  log.log('selectedRowKeys', deviceSelect, applicationSelect);

  const {selectedRowKeys: selectedDeviceRowKeys, loading: loadingDevice} = deviceSelect;
  const {selectedRowKeys: selectedApplicationRowKeys, loading: applicationLoading} = applicationSelect;
  // https://codesandbox.io/s/adoring-cerf-tyioh?file=/index.js
  const deviceRowSelection = {
    selectedDeviceRowKeys,
    onChange: (selectedRowKeys) => {
      setDeviceSelect({
        ...deviceSelect,
        selectedRowKeys,
      });
    },
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      if (selected) {
        setDeviceSelect({
          ...deviceSelect,
          selectedRowKeys: [record.key],
        });
      } else {
        setDeviceSelect({
          ...deviceSelect,
          selectedRowKeys: [],
        });
      }
    },
  };
  const applicationRowSelection = {
    selectedApplicationRowKeys,
    onChange: (selectedRowKeys) => {
      setDeviceSelect({
        ...applicationSelect,
        selectedRowKeys,
      });
    },
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      if (selected) {
        setApplicationSelect({
          ...applicationSelect,
          selectedRowKeys: [record.key],
        });
      } else {
        setApplicationSelect({
          ...applicationSelect,
          selectedRowKeys: [],
        });
      }
    },
  };
  /** @type {import('antd/lib/menu').ItemType[]} */
  const menuItemsDevices = [
    {
      icon: MobileOutlined,
      label: '+',
    },
    {
      icon: MobileOutlined,
      label: '-',
    }, {
      icon: MobileOutlined,
      label: 'x',
    }, {
      icon: MobileOutlined,
      label: '*',
    },
  ].map(({icon, label}, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label,
  }));
  const dataSourceDevices = [
    {
      key: '1',
      name: 'Pixel_7_API_31',
      type: {
        name: 'android',
        icon: AndroidOutlined,
      },
      version: '12.0',
      status: 'Ready',
    },
    {
      key: '2',
      name: 'Pixel_5_API_29',
      type: {
        name: 'ios',
        icon: AppleOutlined,
      },
      version: '9.0',
      status: 'Ready',
    },
  ];
  /** @type {any[]} */
  const columnsDevices = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: ({_name, icon}) => React.createElement(icon),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];
  /** @type {import('antd/lib/menu').ItemType[]} */
  const menuItemsApplications = [
    {
      icon: DownloadOutlined,
      label: '+',
    },
    {
      icon: ShakeOutlined,
      label: '-',
    }, {
      icon: StopOutlined,
      label: 'x',
    }, {
      icon: DeleteOutlined,
      label: '*',
    }, {
      icon: DeleteOutlined,
      label: '*',
    },
  ].map(({icon, label}, index) => ({
    key: String(index + 1),
    icon: React.createElement(icon),
    label,
  }));
  const dataSourceApplications = [
    {
      key: '1',
      name: 'com.google.android.chrome',
      type: {
        name: 'android',
        icon: AndroidOutlined,
      },
      version: '384.0.150',
      status: 'Ready',
    },
    {
      key: '2',
      name: 'com.apple.ios.safari',
      type: {
        name: 'ios',
        icon: AppleOutlined,
      },
      version: '23.6.7',
      status: 'Ready',
    },
    {
      key: '3',
      name: 'com.google.android.calendar',
      type: {
        name: 'android',
        icon: AndroidOutlined,
      },
      version: '12.3.2',
      status: 'Ready',
    },
  ];
  /** @type {any[]} */
  const columnsApplications = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: ({_name, icon}) => React.createElement(icon),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
  ];

  const onDevicesTableRow = (record, rowIndex) => {
    log.log('onDevicesTableRow', record, rowIndex);
    return {
      onClick: (_event) => {
        if (record.key !== deviceSelect?.key) {
          setDeviceSelect({
            ...deviceSelect,
            selectedRowKeys: [record.key],
          });
        } else {
          setDeviceSelect({
            ...deviceSelect,
            selectedRowKeys: [record.key],
          });
        }
      },
    };
  };

  const onApplicationsTableRow = (record, rowIndex) => {
    log.log('onApplicationsTableRow', record, rowIndex);
    return {
      onClick: (_event) => {
        if (record.key !== applicationSelect?.key) {
          setApplicationSelect({
            ...applicationSelect,
            selectedRowKeys: [record.key]
          });
        } else {
          setApplicationSelect({
            ...applicationSelect,
            selectedRowKeys: [record.key]
          });
        }
      },
    };
  };

  useEffect(() => {
    log.debug('-- Devices Table selected:', deviceSelect);
    try {
      if (deviceSelect.selectedRowKeys.length > 0) {
        setCapabilities({
          ...defaultCapabilities,
          'platformName': 'Android',
          'appium:platformVersion': '12.0',
          'appium:automationName': 'uiautomator2',
          'appium:deviceName': 'emulator-5554',
          'appium:noReset': true,
          'appium:printPageSourceOnFindFailure': true,
          // "appium:udid": "emulator-5554",
          // "appium:appPackage": "com.saucelabs.mydemoapp.rn",
          // "appium:app": "\"C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk\"",
          // "appium:appActivity": ".MainActivity"
        });
      } else {
        setCapabilities({
          ...defaultCapabilities,
        });
      }
    } catch (error) {
      log.error('###', error);
    }
  }, [deviceSelect?.selectedRowKeys?.join('')]);

  useEffect(() => {
    log.debug('-- Applications Table selected:', applicationSelect);
    try {
      log.log('applicationSelect.selectedRowKeys =', applicationSelect.selectedRowKeys);
      if (applicationSelect.selectedRowKeys.length > 0) {
        setCapabilities({
          ...defaultCapabilities,
          'appium:appPackage': 'com.saucelabs.mydemoapp.rn',
          'appium:app': '"C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk"',
          'appium:appActivity': '.MainActivity',
        });
      } else {
        setCapabilities({
          ...defaultCapabilities,
        });
      }
    } catch (error) {
      log.error('###', error);
    }
  }, [applicationSelect?.selectedRowKeys?.join('')]);

  useEffect(() => {
    const handleDevicesTblOutsideClick = (e) => {
      if (!applicationsTblRef?.current?.contains(e.target)) {
        log.log('This one gets called because of the click outside', e);
        setApplicationSelect({
          ...applicationSelect,
          selectedRowKeys: [],
        });
      }
    };
    const handleApplicationsTblOutsideClick = (e) => {
      if (!applicationsTblRef?.current?.contains(e.target)) {
        log.log('This one gets called because of the click outside', e);
        setApplicationSelect({
          ...applicationSelect,
          selectedRowKeys: [],
        });
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleDevicesTblOutsideClick, false);
      document.addEventListener('click', handleApplicationsTblOutsideClick, false);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleDevicesTblOutsideClick, false);
      document.removeEventListener('click', handleApplicationsTblOutsideClick, false);
    };
  });

  return (
    <>
      <Row className={SessionStyles.sessionHelper}>
        <Col span={8}>
          <Row>
            <p className={SessionStyles.localDesc}>
              {t('deviceList')}
            </p>
          </Row>
          <Row>
            <Menu
              mode="horizontal"
              selectable={false}
              items={menuItemsDevices}
              style={{flex: 1, minWidth: 0}}
            />
          </Row>
          <Row>
            <Col span={24}>
              {/*<Table dataSource={dataSourceDevices} columns={columnsDevices} pagination={false} size="small"
                   rowSelection={deviceRowSelection} />*/}
              <Table
                ref={devicesTblRef}
                dataSource={dataSourceDevices} columns={columnsDevices} pagination={false}
                size="small"
                rowSelection={{
                  type: 'radio',
                  /*getCheckboxProps: (_record) => {
                    return {
                      style: {
                        display: 'none',
                      },
                    };
                  },*/
                  selectedRowKeys: deviceSelect.selectedRowKeys,
                }}
                onRow={onDevicesTableRow}
              />
            </Col>
            <Col span={24}>
              <Card>
                <p className={SessionStyles.localDesc}>
                  {JSON.stringify(deviceSelect)}
                </p>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={16}>
          <Row>
            <p className={SessionStyles.localDesc}>
              {t('applicationList')}
            </p>
          </Row>
          <Row>
            <Menu
              mode="horizontal"
              selectable={false}
              items={menuItemsApplications}
              style={{flex: 1, minWidth: 0}}
            />
          </Row>
          <Row>
            <Col span={24}>
              {/*<Table dataSource={dataSourceApplications} columns={columnsApplications} pagination={false} size="small"
                   rowSelection={applicationRowSelection} />*/}
              <Table
                ref={applicationsTblRef}
                dataSource={dataSourceApplications}
                columns={columnsApplications}
                pagination={false} size="small"
                rowSelection={{
                  type: 'radio',
                  /*getCheckboxProps: (_record) => {
                    return {
                      style: {
                        display: 'none',
                      },
                    };
                  },*/
                  selectedRowKeys: applicationSelect.selectedRowKeys,
                }}
                onRow={onApplicationsTableRow}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card>
                <p className={SessionStyles.localDesc}>
                  {JSON.stringify(applicationSelect)}
                </p>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
        <pre>
          <code>{JSON.stringify(capabilities, null, 2)}</code>
        </pre>
        </Col>
      </Row>
    </>
  );
};

export default SessionHelper;
