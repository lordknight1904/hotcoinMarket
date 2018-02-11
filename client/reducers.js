/**
 * Root Reducer
 */
import { combineReducers } from 'redux';

// Import Reducers
import app from './modules/App/AppReducer';
import transaction from './modules/Transaction/TransactionReducer';
import home from './modules/Home/HomeReducer';
import order from './modules/Orders/OrderReducer';
import history from './modules/History/HistoryReducer';
// import chat from './modules/Chat/ChatReducer';

// Combine all reducers into one root reducer
export default combineReducers({
  app,
  transaction,
  home,
  order,
  history,
});
