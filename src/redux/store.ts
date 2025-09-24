import { configureStore } from '@reduxjs/toolkit';
import appReducer, { getDefaultAppState } from './appSlice';

export const createStore = () =>
  configureStore({
    reducer: {
      app: appReducer,
    },
    preloadedState: {
      app: getDefaultAppState(),
    },
  });

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
