import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';

// Export Constants
export const ACTIONS = {
  SET_TRANSACTION: 'SET_TRANSACTION',
};

export function setTransaction(transaction){
  return {
    type: ACTIONS.SET_TRANSACTION,
    transaction,
  };
}

export function marketSecond(market) {
  return () => {
    return callApi('market/second', 'post', '', {market}).then(res => {
      return res.market;
    });
  };
}
export function getBankAccount(account, counter) {
  return () => {
    return callApi(`user/account/${account}`, 'get', '').then(res => {
      return {
        res,
        counter,
      }
    });
  };
}
