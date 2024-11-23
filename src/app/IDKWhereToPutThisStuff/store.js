// src/store.js
import { createStore, combineReducers } from 'redux';

// A simple placeholder reducer
const placeholderReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Combine reducers (even if there's only one for now)
const rootReducer = combineReducers({
  placeholder: placeholderReducer,
});

// Create the Redux store without middleware
const store = createStore(rootReducer);

export default store;