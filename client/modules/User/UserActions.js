import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';
// Export Constants
export const ACTIONS = {
  ON_SIGN_IN: 'ON_SIGN_IN',
};


export function confirmUser(token) {
  return () => {
    return callApi(`user/confirm?token=${token}`).then(res => {
      return res;
    });
  };
}
