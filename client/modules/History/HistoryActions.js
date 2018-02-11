import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';
import {addBuyMarket} from "../Home/HomeActions";

// Export Constants
export const ACTIONS = {
  ADD_HISTORY: 'ADD_HISTORY',
};

export function addHistory(history){
  return {
    type: ACTIONS.ADD_HISTORY,
    history
  };
}
export function fetchHistory(userName, coin, currentPage) {
  return (dispatch) => {
    return callApi(`history/${userName}/${coin}/${currentPage}`, 'get', '').then(res => {
      dispatch(addHistory(res.history));
    });
  };
}
