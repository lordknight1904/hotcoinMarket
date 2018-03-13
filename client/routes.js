/* eslint-disable global-require */
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './modules/App/App';

// require.ensure polyfill for node
if (typeof require.ensure !== 'function') {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

/* Workaround for async react routes to work with react-hot-reloader till
  https://github.com/reactjs/react-router/issues/2182 and
  https://github.com/gaearon/react-hot-loader/issues/288 is fixed.
 */
if (process.env.NODE_ENV !== 'production') {
  require('./modules/Home/pages/Home');
  require('./modules/Transaction/pages/Transaction');
  require('./modules/Wallet/pages/Wallet');
  require('./modules/Orders/pages/Orders');
  require('./modules/Profile/pages/Profile');
  require('./modules/History/pages/History');
}

export default (
  <Route path="/" component={App}>
    <IndexRoute
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/Home/pages/Home').default);
        });
      }}
    />
    <Route
      path="orders"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/Orders/pages/Orders').default);
        });
      }}
    />
    <Route
      path="user/confirm"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/User/pages/Confirm').default);
        });
      }}
    />
    <Route
      path="transaction"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/Transaction/pages/Transaction').default);
        });
      }}
    />
    <Route
      path="wallet"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/Wallet/pages/Wallet').default);
        });
      }}
    />
    <Route
      path="profile"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/Profile/pages/Profile').default);
        });
      }}
    />
    <Route
      path="history"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require('./modules/History/pages/History').default);
        });
      }}
    />
  </Route>
);
