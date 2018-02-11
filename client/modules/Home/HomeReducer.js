// Import Actions
import { ACTIONS } from './HomeActions';
import numeral from 'numeral';

// Initial State
const initialState = {
  buy: [],
  sell: [],
  myBuy: [],
  mySell: [],

  maxBuy: 0,
  maxSell: 0,
};

const HomeReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SET_MAX_BUY:
      return { ...state, maxBuy: numeral(action.max).value() };
    case ACTIONS.SET_MAX_SELL:
      return { ...state, maxSell: numeral(action.max).value() };
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
export const getMaxBuy = state => state.home.maxBuy;
export const getMaxSell = state => state.home.maxSell;

// Get showAddPost
// Export Reducer
export default HomeReducer;
