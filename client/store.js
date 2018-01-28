/**
 * Main store function
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import DevTools from './modules/App/components/DevTools';
import rootReducer from './reducers';
import localStorage from 'localStorage';
import { syncRedux } from './util/SynchRedux';
let callAction = {};

function timestampAction(action) {
  return {
    action,
    time: Date.now()
  }
}

function storageMiddleware({ getState, dispatch }) {
  return next => action => {
    const stampedAction = timestampAction(action);
    if (action &&
      action.type !== 'SET_CHAT_SOCKET' &&
      action.type !== 'SIGNUP_SUCCEED' &&
      action.type !== 'ADD_CHAT' &&
      action.type !== 'ADD_CITIES' &&
      action.type !== 'RELOGIN'
    ) {
      if ( action.type === 'SET_CHAT_SOCKET') {
        console.log(action);
      }
      localStorage.setItem('SYNCHRONIZE', JSON.stringify(action));
    }
    next(action);
  }
}
export function configureStore(initialState = {}) {
  // Middleware and store enhancers
  const enhancers = [
    applyMiddleware(thunk, storageMiddleware),
    // applyMiddleware(thunk),
  ];

  if (process.env.CLIENT && process.env.NODE_ENV === 'development') {
    // Enable DevTools only when rendering on client and during development.
    enhancers.push(window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument());
  }

  const store = createStore(rootReducer, initialState, compose(...enhancers));

  // For hot reloading reducers
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextReducer = require('./reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }
  return store;
}
