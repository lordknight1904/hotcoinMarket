import callApi from '../../util/apiCaller';
import localStorage from 'localStorage';

// Export Constants
export const ACTIONS = {
  COIN: 'COIN',
  ON_SIGN_IN: 'ON_SIGN_IN',
  ON_SIGN_UP: 'ON_SIGN_UP',
  ON_CLOSE_SIGN: 'ON_CLOSE_SIGN',
  SET_NOTIFY: 'SET_NOTIFY',
  CLOSE_NOTIFY: 'CLOSE_NOTIFY',
  LOGIN: 'LOGIN',
  ADD_BANK: 'ADD_BANK',
  UPDATE_BALANCE_HOLD: 'UPDATE_BALANCE_HOLD',
  SET_CHAT_SOCKET: 'SET_CHAT_SOCKET',
  LOGOUT: 'LOGOUT',
  UPDATE_RATE: 'UPDATE_RATE',
  SET_LATEST: 'SET_LATEST',
  SET_IS_SUBMITTING: 'SET_IS_SUBMITTING',
  SET_GOOGLE_AUTHENTICATOR: 'SET_GOOGLE_AUTHENTICATOR',
  REFETCH_USER_PROFILE: 'REFETCH_USER_PROFILE',
  ADD_SETTINGS: 'ADD_SETTINGS',
  SET_SLIDE_INDEX: 'SET_SLIDE_INDEX',
};

export function setSlideIndex(slideIndex) {
  return {
    type: ACTIONS.SET_SLIDE_INDEX,
    slideIndex
  };
}
export function logout() {
  return {
    type: ACTIONS.LOGOUT,
  };
}

export function changeCoin(coin) {
  return {
    type: ACTIONS.COIN,
    coin
  };
}
export function onSignIn() {
  return {
    type: ACTIONS.ON_SIGN_IN,
  };
}
export function onSignUp() {
  return {
    type: ACTIONS.ON_SIGN_UP,
  };
}
export function onCloseSign() {
  return {
    type: ACTIONS.ON_CLOSE_SIGN,
  };
}
export function setNotify(message) {
  return {
    type: ACTIONS.SET_NOTIFY,
    message
  };
}
export function closeNotify() {
  return {
    type: ACTIONS.CLOSE_NOTIFY,
  };
}

export function login(user) {
  return {
    type: ACTIONS.LOGIN,
    user
  };
}
export function loginRequest(user) {
  return () => {
    return callApi('user/login', 'post', '', {user}).then(res => {
      return res;
    });
  };
}
export function addBanks(banks) {
  return {
    type: ACTIONS.ADD_BANK,
    banks
  };
}
export function fetchBanks() {
  return (dispatch) => {
    return callApi('bank', 'get', '').then(res => {
      dispatch(addBanks(res.banks));
    });
  };
}
export function addSettings(settings) {
  return {
    type: ACTIONS.ADD_SETTINGS,
    settings
  };
}
export function fetchSettings() {
  return (dispatch) => {
    return callApi('setting', 'get', '').then(res => {
      dispatch(addSettings(res.settings));
    });
  };
}

export function updateBalanceAndHold(wallet) {
  return {
    type: ACTIONS.UPDATE_BALANCE_HOLD,
    wallet
  };
}
export function getBalance(userName, coin) {
  return (dispatch) => {
    return callApi(`user/balance/${userName}/${coin}`, 'get', '' ).then(res => {
      dispatch(updateBalanceAndHold(res.user));
    });
  };
}
export function updateRate(rate) {
  return {
    type: ACTIONS.UPDATE_RATE,
    rate
  };
}
export function fetchRate(coin) {
  return (dispatch) => {
    return callApi(`rate/${coin}`, 'get', '' ).then(res => {
      if (res.rate) {
        dispatch(updateRate(res.rate));
      }
    });
  };
}
export function setSocket(socketIO) {
  return {
    type: ACTIONS.SET_CHAT_SOCKET,
    socketIO
  };
}
export function setLatest(latest) {
  return {
    type: ACTIONS.SET_LATEST,
    latest
  };
}
export function fetchLatest(coin) {
  return (dispatch) => {
    return callApi(`marketlatest/${coin}`, 'get', '' ).then(res => {

      dispatch(setLatest(res.latest));
    });
  };
}


export function setGoogleAuthentication(googleAuthentication){
  return {
    type: ACTIONS.SET_GOOGLE_AUTHENTICATOR,
    googleAuthentication
  };
}
export function cancelGoogle(user) {
  return () => {
    return callApi('user/google/cancel', 'post', '', {user}).then(res => {
      return res;
    });
  };
}
export function googleAuth(user) {
  return () => {
    return callApi('user/google/activate', 'post', '', {user}).then(res => {
      return res;
    });
  };
}
export function updateProfile(profile) {
  return () => {
    return callApi('user/profile', 'put', '', {profile}).then(res => {
      return res;
    });
  };
}
export function setIsSubmitting() {
  return {
    type: ACTIONS.SET_IS_SUBMITTING,
  };
}

export function refetchUserProfile(user) {
  return {
    type: ACTIONS.REFETCH_USER_PROFILE,
    user
  };
}

export function googleFactor(user) {
  return () => {
    return callApi('user/google/authorize', 'post', '', {user}).then(res => {
      return res;
    });
  };
}

export function directSend(send) {
  return () => {
    return callApi('market/send', 'post', '', {send}).then(res => {
      return res;
    });
  };
}
export function createUser(user) {
  return () => {
    return callApi('user/create', 'post', '', {user}).then(res => {
      return res;
    });
  };
}
