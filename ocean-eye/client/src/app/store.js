import { configureStore } from '@reduxjs/toolkit';
import reportReducer from '../features/reportSlice'; // Import the reducer
import authReducer from '../features/authSlice'; // 1. Import auth reducer


export const store = configureStore({
    reducer: {
        reports: reportReducer, // Add the reducer to the store
        auth: authReducer, // 2. Add it to the store
    },
});