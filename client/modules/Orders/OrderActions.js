import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';

// Export Constants
export const ACTIONS = {
  ADD_MY_TRADING: 'ADD_MY_TRADING',
  UPDATE_TRANSACTION_DETAIL: 'UPDATE_TRANSACTION_DETAIL',

};

export function addMyTradingMarket(market){
  return {
    type: ACTIONS.ADD_MY_TRADING,
    market
  };
}
export function getMyTradingMarket(coin, userName) {
  return (dispatch) => {
    return callApi(`market/trading/${coin}/${userName}`, 'get', '').then(res => {
      dispatch(addMyTradingMarket(res.market));
    });
  };
}

export function updateTransactionDetail(transaction){
  return {
    type: ACTIONS.UPDATE_TRANSACTION_DETAIL,
    transaction,
  };
}
export function marketThird(market) {
  return (dispatch) => {
    return callApi('market/third', 'post', '', {market}).then(res => {
      if (res.market !== 'error' && res.market !== 'not ready') {
        dispatch(updateTransactionDetail(res.market));
      }
      return res.market;
    });
  };
}
export function marketDone(market) {
  return () => {
    return callApi('market/done', 'post', '', {market}).then(res => {
      return res;
    });
  };
}
