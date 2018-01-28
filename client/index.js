/**
 * Client entry point
 */
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';
import { configureStore } from './store';

// Initialize store
const store = configureStore(window.__INITIAL_STATE__);
const mountApp = document.getElementById('root');
export function createStorageListener(store) {
  return event => {
    if (event.key === 'SYNCHRONIZE') {
      const action = JSON.parse(event.newValue);
      if (action &&
        // action.type !== 'SET_CHAT_SOCKET' &&
        action.type !== 'SIGNUP_SUCCEED' &&
        action.type !== 'ADD_CHAT' &&
        action.type !== 'ADD_CITIES' &&
        action.type !== 'RELOGIN'
      ) {
        store.dispatch(action);
      }
    }
  }
}
window.addEventListener('storage', createStorageListener(store));
render(
  <AppContainer>
    <App store={store} />
  </AppContainer>,
  mountApp
);

// For hot reloading of react components
if (module.hot) {
  module.hot.accept('./App', () => {
    // If you use Webpack 2 in ES modules mode, you can
    // use <App /> here rather than require() a <NextApp />.
    const NextApp = require('./App').default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextApp store={store} />
      </AppContainer>,
      mountApp
    );
  });
}
