// Import Actions
import { ACTIONS } from './UserActions';

// Initial State
const initialState = {
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const getSignUp = state => state.user.isSignUp;

// Export Reducer
export default UserReducer;
