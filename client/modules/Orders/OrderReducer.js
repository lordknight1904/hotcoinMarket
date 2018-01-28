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
    default:
      return state;
  }
};

/* Selectors */
export const getTrading = state => state.order.trading;

// Get showAddPost
// Export Reducer
export default OrderReducer;
