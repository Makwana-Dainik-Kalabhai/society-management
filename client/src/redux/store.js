import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import societyReducer from './slices/societySlice';
import complaintReducer from './slices/complaintSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    society: societyReducer,
    complaints: complaintReducer,
    notifications: notificationReducer
  }
});

export default store;
