import React from 'react';
import {createRoot} from 'react-dom/client';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import Root from './Root.jsx';
import store from './store.js';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <Root store={store} />
  </ErrorBoundary>,
);

// noinspection JSUnresolvedReference
if (module.hot) {
  module.hot.accept('./Root', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NextRoot = require('./Root.jsx').default;
    root.render(
      <ErrorBoundary>
        <NextRoot store={store} />
      </ErrorBoundary>,
    );
  });
}
