// Import Actions
import { ACTIONS } from './AppActions';
import cuid from 'cuid';
import update from 'react-addons-update';
import {REHYDRATE} from 'redux-persist/constants'

// Initial State
const initialState = {
  isSignUp: false,
  isSignIn: false,
  isNotify: false,
  message: '',

  id: '',
  email: '',
  userName: '',
  token: '',
  googleAuthentication: false,
  googleSecret: {},

  coin: 'BTC',
  coinList: [
    { name: 'USDT', unit: 100000, fee: 50000 },
    { name: 'BTC', unit: 100000000, fee: 50000 },
    { name: 'ETH', unit: 1000000000000000000, fee: 0 },
    { name: 'LTC', unit: 100000000, fee: 50000 },
    { name: 'DASH', unit: 100000000, fee: 50000 },
  ],

  isSubmitting: false,
  approved: false,
  realName: '',
  phone: '',

  rates: {},
  latest: {},
  wallets: {},

  socketIO: {},
  banks: [],
  settings: [],

  slideIndex: 0,
};

const AppReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SET_SLIDE_INDEX: {
      return {...state, slideIndex: action.slideIndex };
    }
    case ACTIONS.ADD_SETTINGS: {
      return {...state, settings: action.settings };
    }
    case ACTIONS.LOGOUT: {
      return {...state, id: '', email: '', userName: '', token: ''};
    }
    case ACTIONS.UPDATE_RATE:
      return {
        ...state,
        rates: {
          ...state.rates,
          [action.rate.coin]: action.rate
        }
      };
    case ACTIONS.SET_LATEST:
      return {
        ...state,
        latest: {
          ...state.latest,
          [action.latest.coin]: action.latest
        }
      };
    case ACTIONS.SET_CHAT_SOCKET:
      return { ...state, socketIO: action.socketIO };
    case ACTIONS.LOGIN:
      return {
        ...state,
        id: action.user.id,
        email: action.user.email,
        userName: action.user.userName,
        token: action.user.token,
        googleAuthentication: action.user.googleAuthentication,
        googleSecret: action.user.googleSecret,
        isSubmitting: action.user.isSubmitting,
        approved: action.user.approved,
        realName: action.user.realName,
        isInform: action.user.isInform,
        requireInform: action.user.requireInform,
        phone: action.user.phone,
      };
    case ACTIONS.COIN:
      return { ...state, coin: action.coin };
    case ACTIONS.ADD_BANK:
      return { ...state, banks: action.banks };
    case ACTIONS.ON_SIGN_IN:
      return { ...state, isSignIn: true, isSignUp: false };
    case ACTIONS.ON_SIGN_UP:
      return { ...state, isSignIn: false, isSignUp: true };
    case ACTIONS.ON_CLOSE_SIGN:
      return { ...state, isSignIn: false, isSignUp: false };
    case ACTIONS.SET_NOTIFY:
      return { ...state, isNotify: true, message: action.message };
    case ACTIONS.CLOSE_NOTIFY:
      return { ...state, isNotify: false, message: '' };
    case ACTIONS.UPDATE_BALANCE_HOLD: {
      return {
        ...state,
        wallets: {
          ...state.wallets,
          [action.wallet.coin]: action.wallet
        }
      };
    }
    case ACTIONS.SET_GOOGLE_AUTHENTICATOR:
      return { ...state, googleAuthentication: action.googleAuthentication };
    default:
      return state;
  }
};

/* Selectors */
export const getBanks = state => state.app.banks;
export const getLatest = state => state.app.latest;
export const getIsNotify = state => state.app.isNotify;
export const getMessage = state => state.app.message;
export const getSignUp = state => state.app.isSignUp;
export const getSignIn = state => state.app.isSignIn;
export const getId = state => state.app.id;
export const getEmail = state => state.app.email;
export const getUserName = state => state.app.userName;
export const getGoogleAuthentication = state => state.app.googleAuthentication;
export const getGoogleSecret = state => state.app.googleSecret;
export const getToken = state => state.app.token;
export const getIsSubmitting = state => state.app.isSubmitting;
export const getApproved = state => state.app.approved;
export const getRealName = state => state.app.realName;
export const getPhone = state => state.app.phone;
export const getWallets = state => state.app.wallets;
export const getRates = state => state.app.rates;
export const getSocket = state => state.app.socketIO;

export const getCoin = state => state.app.coin;
export const getCoinList = state => state.app.coinList;
export const getSettings = state => state.app.settings;
export const getSlideIndex = state => state.app.slideIndex;

// Get showAddPost
// Export Reducer
export default AppReducer;
