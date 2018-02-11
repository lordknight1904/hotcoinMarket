// Import Actions
import { ACTIONS } from './ProfileActions';

// Initial State
const initialState = {
};

const ProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.TOGGLE_GOOGLE: {
      return { ...state}
    }
    default:
      return state;
  }
};


export default ProfileReducer;
