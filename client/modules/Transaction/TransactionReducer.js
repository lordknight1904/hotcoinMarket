// Import Actions
import { ACTIONS } from './TransactionActions';
import cuid from 'cuid';
import update from 'react-addons-update';
import {REHYDRATE} from 'redux-persist/constants'

// Initial State
const initialState = {
  transaction: {},
};

const TransactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SET_TRANSACTION:
      return { ...state, transaction: action.transaction };
    default:
      return state;
  }
};

/* Selectors */
export const getTransaction = state => state.transaction.transaction;

// Get showAddPost
// Export Reducer
export default TransactionReducer;
