import {Alert, Modal} from 'antd';
import {Suspense, useCallback, useEffect, useState} from 'react';
import {connect, Provider, useDispatch, useSelector} from 'react-redux';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
// import {bindActionCreators} from 'redux';

import Spinner from './components/Spinner/Spinner.jsx';
import {ALERT} from './constants/antd-types.js';
import InspectorPage from './containers/InspectorPage';
import SessionPage from './containers/SessionPage';
import i18n, {withTranslation} from './i18next';
import {ipcRenderer} from './polyfills';
import StatusBar from './StatusBar.jsx';
import {selectorIsAppiumServerRunning, selectorIsTestServerRunning, setAppiumServerRunning, setTesting, setTestServerRunning} from './stores/serverSlice';
// import {selectorIsAppiumServerRunning, selectorIsTesting, selectorIsTestServerRunning} from './stores/serverSlice';
import {log} from './utils/logger.js';

ipcRenderer.on('appium-language-changed', (event, message) => {
  if (i18n.language !== message.language) {
    i18n.changeLanguage(message.language);
  }
});

const Root = ({store}) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/']}>
      <Suspense fallback={<Spinner />}>
        <ConnectedRootWrapper>
          <Routes>
            <Route path="/" element={<SessionPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/inspector" element={<InspectorPage />} />
          </Routes>
          <StatusBar />
        </ConnectedRootWrapper>
      </Suspense>
    </MemoryRouter>
  </Provider>
);

const RootWrapper = (props) => {
  // const {children, setTesting} = props;
  const {children} = props;
  const dispatch = useDispatch();
  const [visibleTestResult, setVisibleTestResult] = useState(false);
  const [lastOutput, setLastOutput] = useState();
  const [errorMessage, setErrorMessage] = /** @type {[Error, React.Dispatch<React.SetStateAction<Error>>]} */ useState();
  const isAppiumServerRunning = useSelector(selectorIsAppiumServerRunning);
  const isTestServerRunning = useSelector(selectorIsTestServerRunning);

  useEffect(() => {
    ipcRenderer.on('appium-server', (event, ...args) => {
      log.log('<appium-server>~~~~~~~~~~~~~~~~~~~~', ...args);
      const [eventName, eventType, eventCategory, eventData] = args;
      if (eventName === 'server') {
        // TODO:
        // dispatch(setAppiumServerRunning(eventType === 'started'));
      }
    });

    ipcRenderer.on('test-server', (event, ...args) => {
      log.log('<test-server>~~~~~~~~~~~~~~~~~~~~', ...args);
      const [eventName, eventType, eventCategory, eventData] = args;
      if (eventType === 'error') {
        const message = `${eventType}:${eventData ? (typeof eventData === 'string' ? eventData : (eventData.message ?? eventData.error?.toString?.() ?? eventData.error?.message)) : 'unknown'}`;
        // setErrorMessage(new Error(message));
        // return;
        throw new Error(message);
      }
      if (eventName === 'server') {
        if (eventType === 'data') {
          switch (eventCategory) {
            case 'output':
              setLastOutput(eventData);
              break;
            case 'die':
              dispatch(setTestServerRunning(false));
              setVisibleTestResult(true);
              break;
            case 'end':
              dispatch(setTestServerRunning(false));
              setVisibleTestResult(true);
              break;
          }
        }
      } else if (eventName === 'tester') {
        if (eventType === 'data') {
          switch (eventCategory) {
            case 'output':
              /*{
                "phase": 2,
                "message": "\r\nTest run finished after 9071 ms\r\n[         4 containers found      ]\r\n[         0 containers skipped    ]\r\n[         4 containers started    ]\r\n[         0 containers aborted    ]\r\n[         4 containers successful ]\r\n[         0 containers failed     ]\r\n[         1 tests found           ]\r\n[         0 tests skipped         ]\r\n[         1 tests started         ]\r\n[         0 tests aborted         ]\r\n[         1 tests successful      ]\r\n[         0 tests failed          ]\r\n\r\n"
              }*/
              setLastOutput(eventData);
              break;
            case 'die':
              dispatch(setTesting(false));
              setVisibleTestResult(true);
              break;
            case 'end':
              dispatch(setTesting(false));
              setVisibleTestResult(true);
              break;
          }
        }
      }
    });
  }, []);

  // DEBUG:
  useEffect(() => {
    if (visibleTestResult) {
      log.debug('-----', lastOutput);
    }
  }, [visibleTestResult]);

  const fetchData = useCallback(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // throw new Error(`Response status: ${response.status}`);
        // TODO: show error message;
        return false;
      }

      const json = await response.json();
      log.debug(json);
      return json;
    } catch (e) {
      //
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (!isAppiumServerRunning) {
      const checkIsServerRunning = async () => {
        const response = await fetchData('http://127.0.0.1:4723/status');
        /*
        {
          "value": {
            "ready": true,
            "message": "The server is ready to accept new connections",
            "build": {
              "version": "2.11.5",
              "git-sha": "e8886ae0d276ac4f97a1bdb88998fc30fbd936fa",
              "built": "2024-09-26 21:13:25 +0000"
            }
          }
        }
        */
        if (response?.value?.ready) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          dispatch(setAppiumServerRunning(true));
          // setIsLoading(false);
        } else {
          // setIsLoading(true);
        }
      };
      intervalId = setInterval(async () => {
        if (!isAppiumServerRunning) {
          await checkIsServerRunning();
        }
      }, 5000);
      (async () => checkIsServerRunning())();
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAppiumServerRunning]);

  useEffect(() => {
    let intervalId;
    if (!isTestServerRunning) {
      const checkIsServerRunning = async () => {
        const response = await fetchData('http://127.0.0.1:4724/status');
        /*
        {
          "value": {
            "ready": true,
            "message": "The server is ready to accept new connections",
            "build": {
              "version": "2.11.5",
              "sha": "e8886ae0d276ac4f97a1bdb88998fc30fbd936fa",
              "built": "2024-09-26 21:13:25 +0000"
            }
          }
        }
        */
        if (response?.value?.ready) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          dispatch(setTestServerRunning(true));
          // setIsLoading(false);
        } else {
          // setIsLoading(true);
        }
      };
      intervalId = setInterval(async () => {
        if (!isAppiumServerRunning) {
          await checkIsServerRunning();
        }
      }, 5000);
      (async () => checkIsServerRunning())();
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTestServerRunning]);

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
            {i18n.t('Error')}: <code>{errorMessage?.message}</code>
          </>
        }
        type={ALERT.ERROR}
        showIcon
      />)
    }
  </>);
};

function mapStateToProps(state) {
  return state.session;
}
/*
function mapStateToProps(state) {
  return {
    ...state.session,
    ...state.server,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // setTesting: (payload) => dispatch(serverActions.setIsTesting(payload)),
    ...bindActionCreators({
      setTesting,
    }, dispatch),
  };
}
*/

// const ConnectedRootWrapper = withTranslation(RootWrapper, connect(mapStateToProps, mapDispatchToProps));
/*const ConnectedRootWrapper = withTranslation(RootWrapper, connect(mapStateToProps, {
  setTesting,
}));*/
const ConnectedRootWrapper = withTranslation(RootWrapper, connect(mapStateToProps));

export default Root;
