import React from 'react';
import {createRoot} from 'react-dom/client';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import Root from './Root.jsx';
import store from './store.js';
import {DevSupport} from '@react-buddy/ide-toolbox';
import {ComponentPreviews, useInitial} from './dev';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <DevSupport ComponentPreviews={ComponentPreviews}
                useInitialHook={useInitial}
    >
      <Root store={store} />
    </DevSupport>
  </ErrorBoundary>
);

if (module.hot) {
  module.hot.accept('./Root', () => {
    const NextRoot = require('./Root.jsx').default;
    root.render(
      <ErrorBoundary>
        <NextRoot store={store} />
      </ErrorBoundary>
    );
  });
}
