// Import Actions
import { ACTIONS } from './HistoryActions';
import numeral from 'numeral';

// Initial State
const initialState = {
  history: [],
  currentPage: 1,
  maxPage: 1,
};

const HistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.ADD_HISTORY:
      return { ...state, history: action.history };
    default:
      return state;
  }
};

/* Selectors */
export const getHistory = state => state.history.history;
export const getCurrentPage = state => state.history.currentPage;
export const getMaxPage = state => state.history.maxPage;

// Get showAddPost
// Export Reducer
export default HistoryReducer;
