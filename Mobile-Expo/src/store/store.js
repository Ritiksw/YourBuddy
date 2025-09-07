import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import buddySlice from './buddySlice';
import chatSlice from './chatSlice';
import goalsSlice from './goalsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    buddy: buddySlice,
    chat: chatSlice,
    goals: goalsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
}); 