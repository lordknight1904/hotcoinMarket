// Import Actions
import { ACTIONS } from './HomeActions';
import cuid from 'cuid';
import update from 'react-addons-update';
import {REHYDRATE} from 'redux-persist/constants'

// Initial State
const initialState = {
  buy: [],
  sell: [],
  myBuy: [],
  mySell: [],
};

const HomeReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.ADD_BUY:
      return { ...state, buy: action.market };
    case ACTIONS.ADD_SELL:
      return { ...state, sell: action.market };
    case ACTIONS.ADD_MY_BUY:
      return { ...state, myBuy: action.market };
    case ACTIONS.ADD_MY_SELL:
      return { ...state, mySell: action.market };
    default:
      return state;
  }
};

/* Selectors */
export const getBuy = state => state.home.buy;
export const getSell = state => state.home.sell;
export const getMyBuy = state => state.home.myBuy;
export const getMySell = state => state.home.mySell;

// Get showAddPost
// Export Reducer
export default HomeReducer;
