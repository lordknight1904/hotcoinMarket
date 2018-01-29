// Import Actions
import { ACTIONS } from './OrderActions';
import cuid from 'cuid';
import update from 'react-addons-update';
import {REHYDRATE} from 'redux-persist/constants'

// Initial State
const initialState = {
  trading: []
};

const OrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.ADD_MY_TRADING:
      return { ...state, trading: action.market };
    case ACTIONS.UPDATE_TRANSACTION_DETAIL:
      const index  = state.trading.map((t, i) => {
        if (t._id === action.transaction._id) {
          return i;
        }
      });
      return {
        ...state,
        trading: [...state.trading.slice(0, index), action.transaction, ...state.trading.slice(index + 1)],
      };
    default:
      return state;
  }
};

/* Selectors */
export const getTrading = state => state.order.trading;

// Get showAddPost
// Export Reducer
export default OrderReducer;
