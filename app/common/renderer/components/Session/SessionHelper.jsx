import React, {useEffect, useRef, useState} from 'react';
import {
  MobileOutlined, ReloadOutlined, AndroidOutlined, AppleOutlined,
  DownloadOutlined, ShakeOutlined, StopOutlined, DeleteOutlined, // ResetOutlined,
} from '@ant-design/icons';
import {Button, Card, Checkbox, Col, Form, List, Menu, Row, Select, Table} from 'antd';

import SessionStyles from './Session.module.css';
import InspectorStyles from '../Inspector/Inspector.module.css';
import {SERVER_TYPES} from '../../constants/session-builder';
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
    case SERVER_TYPES.BROWSERSTACK:
      return `${session.id} — ${formatCapsBrowserstack(session.capabilities)}`;
    case SERVER_TYPES.LAMBDATEST:
      return `${session.id} - ${formatCapsLambdaTest(session.capabilities)}`;
    default:
      return `${session.id} — ${formatCaps(session.capabilities)}`;
  }
};

const defaultCapabilities = {
  // "platformName": "Android",
  // "appium:platformVersion": "12.0",
  // 'appium:automationName': 'uiautomator2',
  // "appium:deviceName": "emulator-5554",
  'appium:noReset': false,
  // "appium:udid": "emulator-5554",
  // "appium:appPackage": "com.saucelabs.mydemoapp.rn",
  // "appium:app": "\"C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk\"",
  // "appium:appActivity": ".MainActivity"
  'appium:fullReset': false,
  'appium:printPageSourceOnFindFailure': true,
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
      platform: {
        name: 'Android', // TODO: read using adb
        version: '12.0',
        icon: AndroidOutlined, // TODO: assign according to platform.name
      },
      udid: 'emulator-5554', // TODO: read using adb
      status: 'Ready',
    },
    {
      key: '2',
      name: 'Pixel_5_API_33',
      platform: {
        name: 'iOS', // TODO: read using libs
        version: '17.5.1', // TODO: read using libs
        icon: AppleOutlined, // TODO: assign according to platform.name
      },
      udid: 'emulator-5554', // TODO: read using adb
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
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: ({name, icon}, record) => React.createElement(icon),
    },
    {
      title: 'Version',
      dataIndex: 'platform',
      key: 'platform',
      render: ({version}, record) => <span>{version}</span>,
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
      package: 'com.saucelabs.mydemoapp.rn',
      platform: {
        name: 'Android',
        icon: AndroidOutlined,
      },
      app: 'C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk',
      activity: '.MainActivity',
      version: '384.0.150',
      status: 'Ready',
    },
    {
      key: '2',
      package: 'com.sptek.mydemoapp',
      platform: {
        name: 'iOS',
        icon: AppleOutlined,
      },
      app: 'C:\\Users\\keiches\\Projects\\appium\\ipas\\Android-MyDemoAppRN.1.3.0.build-244.zip',
      activity: '.MainActivity',
      version: '23.6.7',
      status: 'Ready',
    },
    {
      key: '3',
      package: 'com.google.android.calendar',
      platform: {
        name: 'Android',
        icon: AndroidOutlined,
      },
      app: 'C:\\Users\\keiches\\Projects\\appium\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk',
      activity: '.MainActivity',
      version: '12.3.2',
      status: 'Ready',
    },
  ];
  /** @type {any[]} */
  const columnsApplications = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: ({name, icon}, record) => React.createElement(icon),
    },
    {
      title: 'Name',
      dataIndex: 'package',
      key: 'package',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
  ];

  const [capabilitiesNoReset, setCapabilitiesNoReset] = React.useState(false);
  const [capabilitiesFullReset, setCapabilitiesFullReset] = React.useState(false);

  const onDevicesTableRow = (record, rowIndex) => {
    log.log('onDevicesTableRow', record, rowIndex);
    return {
      onClick: (event) => {
        log.log('onDevicesTableRowClick:', event);
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
      onClick: (event) => {
        log.log('onApplicationsTableRowClick:', event);
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

  const onNoResetChange = (event) => {
    log.log('noReset: checked = ', event.target.checked);
    setCapabilitiesNoReset(event.target.checked);
  };

  const onFullResetChange = (event) => {
    log.log('FullReset: checked = ', event.target.checked);
    setCapabilitiesFullReset(event.target.checked);
  };

  useEffect(() => {
    log.debug('Devices or Applications Table selected:', deviceSelect, applicationSelect);
    try {
      let newCapabilities = {
        ...capabilities,
      };
      if ((deviceSelect.selectedRowKeys.length === 0) && (applicationSelect.selectedRowKeys.length === 0)) {
        setCapabilities(newCapabilities);
        return;
      }
      if (deviceSelect.selectedRowKeys.length > 0) {
        log.log('- Device selected:', deviceSelect.selectedRowKeys);
        // const dataSourceDevice = dataSourceDevices[deviceSelect.selectedRowKeys[0]];
        const dataSourceDevice = dataSourceDevices.find(({key}) => key === deviceSelect.selectedRowKeys[0]);
        newCapabilities = {
          ...newCapabilities,
          platformName: dataSourceDevice.platform.name,
          'appium:platformVersion': dataSourceDevice.platform.version,
          'appium:automationName': dataSourceDevice.platform.name === 'Android' ? 'UIAutomator2' : 'XCUITest',
          'appium:deviceName': dataSourceDevice.name,
          // 'appium:udid': dataSourceDevice.udid,
        };
      } else {
        delete newCapabilities.platformName;
        delete newCapabilities['appium:platformVersion'];
        delete newCapabilities['appium:automationName'];
        delete newCapabilities['appium:deviceName'];
      }
      if (applicationSelect.selectedRowKeys.length > 0) {
        log.log('- Application selected:', applicationSelect.selectedRowKeys);
        // const dataSourceApplication = dataSourceApplications[applicationSelect.selectedRowKeys[0]];
        const dataSourceApplication = dataSourceApplications.find(({key}) => key === applicationSelect.selectedRowKeys[0]);
        newCapabilities = {
          ...newCapabilities,
          'appium:appPackage': dataSourceApplication.package,
          'appium:app': dataSourceApplication.app,
          'appium:appActivity': dataSourceApplication.activity,
        };
      } else {
        delete newCapabilities['appium:appPackage'];
        delete newCapabilities['appium:app'];
        delete newCapabilities['appium:appActivity'];
      }
      setCapabilities({
        ...newCapabilities,
      });
    } catch (error) {
      log.error('Failed to set Devices or Applications capabilities', error);
    }
  }, [deviceSelect?.selectedRowKeys?.[0], applicationSelect?.selectedRowKeys?.[0]]);

  useEffect(() => {
    log.debug('Appium:noReset:', capabilitiesNoReset);
    try {
      log.log('- Capabilities::', 'appium:noReset =', capabilitiesNoReset);
      setCapabilities({
        ...capabilities,
        'appium:noReset': capabilitiesNoReset,
      });
    } catch (error) {
      log.error('Failed to set capabilities::appium:noRest', error);
    }
  }, [capabilitiesNoReset]);

  useEffect(() => {
    log.debug('Appium:fullReset:', capabilitiesFullReset);
    try {
      log.log('- Capabilities::', 'appium:fullReset =', capabilitiesFullReset);
      setCapabilities({
        ...capabilities,
        'appium:fullReset': capabilitiesFullReset,
      });
    } catch (error) {
      log.error('Failed to set capabilities::appium:fullRest', error);
    }
  }, [capabilitiesFullReset]);

  /*useEffect(() => {
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
  });*/

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
                  /*renderCell() {
                    // .ant-table-selection-column { display: none; } 필요
                    return null;
                  },*/
                  selectedRowKeys: deviceSelect.selectedRowKeys,
                }}
                onRow={onDevicesTableRow}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Checkbox onChange={onNoResetChange}>No Reset?</Checkbox>
              <p>The app data will NOT be cleared before this session starts.</p>
            </Col>
          </Row>
          <Row>
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
                  /*renderCell() {
                    // .ant-table-selection-column { display: none; } 필요
                    return null;
                  },*/
                  selectedRowKeys: applicationSelect.selectedRowKeys,
                }}
                onRow={onApplicationsTableRow}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Checkbox onChange={onFullResetChange}>Full Reset?</Checkbox>
              <p>The app will get uninstalled and all data will be cleared.</p>
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
