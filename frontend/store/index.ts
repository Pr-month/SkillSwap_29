import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore, Store } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore } from 'redux-persist';
import storage from './storage';
import appReducer from './app';
import userReducer from './user';
import { skillSwapApi } from '@/store/skillSwapApi/skillSwapApi';

const appPersistConfig = {
  key: 'SkillSwap-app',
  storage,
  blacklist: ['skillSwapApi'], // Don't persist API cache
};

const userPersistConfig = {
  key: 'SkillSwap-user',
  storage,
  blacklist: ['loading', 'error'], // Don't persist loading and error states
  // Whitelist the fields we want to persist
  whitelist: ['isAuthenticated', 'accessToken', 'refreshToken', 'currentUser'],
};

const persistedApp = persistReducer(appPersistConfig, appReducer);
const persistedUser = persistReducer(userPersistConfig, userReducer);

const store: Store = configureStore({
  reducer: {
    app: persistedApp,
    user: persistedUser,
    [skillSwapApi.reducerPath]: skillSwapApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(skillSwapApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const persistor = persistStore(store);

export { store, persistor };
