import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';

// Export Constants
export const ACTIONS = {
  ADD_SELL: 'ADD_SELL',
  ADD_BUY: 'ADD_BUY',
  ADD_MY_SELL: 'ADD_MY_SELL',
  ADD_MY_BUY: 'ADD_MY_BUY',
  SET_MAX_BUY: 'SET_MAX_BUY',
  SET_MAX_SELL: 'SET_MAX_SELL',
};

export function setMaxBuy(max){
  return {
    type: ACTIONS.SET_MAX_BUY,
    max
  };
}
export function setMaxSell(max){
  return {
    type: ACTIONS.SET_MAX_SELL,
    max
  };
}
export function createMarketOrder(market) {
  return () => {
    return callApi('market', 'post', '', {market}).then(res => {
      return res;
    });
  };
}

export function addBuyMarket(market){
  return {
    type: ACTIONS.ADD_BUY,
    market
  };
}
export function addSellMarket(market){
  return {
    type: ACTIONS.ADD_SELL,
    market
  };
}
export function getBuyMarket(coin, max) {
  return (dispatch) => {
    return callApi(`market/${coin}/buy?max=${max}`, 'get', '').then(res => {
      dispatch(addBuyMarket(res.market));
    });
  };
}
export function getSellMarket(coin, max) {
  return (dispatch) => {
    return callApi(`market/${coin}/sell?max=${max}`, 'get', '').then(res => {
      dispatch(addSellMarket(res.market));
    });
  };
}
export function addMyBuyMarket(market){
  return {
    type: ACTIONS.ADD_MY_BUY,
    market
  };
}
export function addMySellMarket(market){
  return {
    type: ACTIONS.ADD_MY_SELL,
    market
  };
}
export function getMyBuyMarket(coin, userName) {
  return (dispatch) => {
    return callApi(`market/open/${coin}/${userName}/buy?`, 'get', '').then(res => {
      dispatch(addMyBuyMarket(res.market));
    });
  };
}
export function getMySellMarket(coin, userName) {
  return (dispatch) => {
    return callApi(`market/open/${coin}/${userName}/sell`, 'get', '').then(res => {
      dispatch(addMySellMarket(res.market));
    });
  };
}
export function deleteMarketOrder(market) {
  return () => {
    return callApi('market', 'delete', '', {market}).then(res => {
      return res;
    });
  };
}

export function marketFirst(market) {
  return () => {
    return callApi('market/first', 'post', '', {market}).then(res => {
      return res;
    });
  };
}
