import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';

// Export Constants
export const ACTIONS = {
  ADD_MY_TRADING: 'ADD_MY_TRADING',

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
