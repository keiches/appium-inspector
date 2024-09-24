import {Alert, Modal} from 'antd';
import React, {Suspense} from 'react';
import {Provider, useDispatch} from 'react-redux';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import Spinner from './components/Spinner/Spinner.jsx';
import InspectorPage from './containers/InspectorPage';
import SessionPage from './containers/SessionPage';
import i18n from './i18next';
import {ipcRenderer} from './polyfills';
import StatusBar from './StatusBar.jsx';
import {log} from './utils/logger.js';
import {ALERT} from './constants/antd-types.js';
import {serverActions} from './stores/serverSlice.js';

ipcRenderer.on('appium-language-changed', (event, message) => {
  if (i18n.language !== message.language) {
    i18n.changeLanguage(message.language);
  }
});

const Root = ({store}) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/']}>
      <Suspense fallback={<Spinner />}>
        <RootWrapper>
          <Routes>
            <Route path="/" element={<SessionPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/inspector" element={<InspectorPage />} />
          </Routes>
          <StatusBar />
        </RootWrapper>
      </Suspense>
    </MemoryRouter>
  </Provider>
);

const RootWrapper = ({children}) => {
  const dispatch = useDispatch();
  const [visibleTestResult, setVisibleTestResult] = React.useState(false);
  const [lastOutput, setLastOutput] = React.useState();
  const [errorMessage, setErrorMessage] = /** @type {[Error, React.Dispatch<React.SetStateAction<Error>>]} */ React.useState();

  React.useEffect(() => {
    ipcRenderer.on('appium-server', (event, ...args) => {
      log.log('<appium-server>~~~~~~~~~~~~~~~~~~~~', ...args);
    });

    ipcRenderer.on('test-server', (event, ...args) => {
      const [eventName, eventType, eventCategory, eventData] = args;
      log.log('<test-server>~~~~~~~~~~~~~~~~~~~~', ...args);
      if (eventType === 'error') {
        const message = `${eventType}:${eventData ? (typeof eventData === 'string' ? eventData : (eventData.message ?? eventData.error?.toString?.() ?? eventData.error?.message)) : 'unknown'}`;
        // setErrorMessage(new Error(message));
        // return;
        throw new Error(message);
      }
      if (eventName === 'server') {
        if (eventType === 'data') {
          switch (eventCategory) {
            case 'output': /*{
              "phase": 2,
              "message": "\r\nTest run finished after 9071 ms\r\n[         4 containers found      ]\r\n[         0 containers skipped    ]\r\n[         4 containers started    ]\r\n[         0 containers aborted    ]\r\n[         4 containers successful ]\r\n[         0 containers failed     ]\r\n[         1 tests found           ]\r\n[         0 tests skipped         ]\r\n[         1 tests started         ]\r\n[         0 tests aborted         ]\r\n[         1 tests successful      ]\r\n[         0 tests failed          ]\r\n\r\n"
            }*/
              setLastOutput(eventData);
              break;
            case 'die':
              dispatch(serverActions.setIsTesting(false));
              setVisibleTestResult(true);
              break;
            case 'end':
              dispatch(serverActions.setIsTesting(false));
              setVisibleTestResult(true);
              break;
          }
        }
      } else if (eventName === 'tester') {
        if (eventType === 'data') {
          switch (eventCategory) {
            case 'output': /*{
              "phase": 2,
              "message": "\r\nTest run finished after 9071 ms\r\n[         4 containers found      ]\r\n[         0 containers skipped    ]\r\n[         4 containers started    ]\r\n[         0 containers aborted    ]\r\n[         4 containers successful ]\r\n[         0 containers failed     ]\r\n[         1 tests found           ]\r\n[         0 tests skipped         ]\r\n[         1 tests started         ]\r\n[         0 tests aborted         ]\r\n[         1 tests successful      ]\r\n[         0 tests failed          ]\r\n\r\n"
            }*/
              setLastOutput(eventData);
              break;
            case 'die':
              serverActions.setIsTesting(false);
              setVisibleTestResult(true);
              break;
            case 'end':
              serverActions.setIsTesting(false);
              setVisibleTestResult(true);
              break;
          }
        }
      }
    });
  }, []);

  React.useEffect(() => {
    if (visibleTestResult) {
    log.debug('-----', lastOutput);
    }
  }, [visibleTestResult]);

  return (<>
    {children}
    {!!visibleTestResult && (
      <Modal
        title="시험 종료"
        open={visibleTestResult}
        onOk={() => {
          setVisibleTestResult(false);
        }}
        onCancel={() => {
          setVisibleTestResult(false);
        }}
      >
          <pre>
            <code>{(lastOutput ?? 'Unknown')?.trim?.()?.replaceAll?.('\r\n', '\n')}</code>
          </pre>
      </Modal>
    )}
    {!!errorMessage & (
      <Alert
        message={
          <>
            {i18n.t('Error:')} <code>{errorMessage?.message}</code>
          </>
        }
        type={ALERT.ERROR}
        showIcon
      />)
    }
  </>);
};

export default Root;
