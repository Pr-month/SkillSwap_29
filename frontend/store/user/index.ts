import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/store/types';

// Define TypeScript interfaces based on backend entities
export type { Skill, User } from '@/store/types';

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Authentication actions
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        // Ensure favoriteSkills is initialized as an empty array if it's missing
        const userWithFavorites = {
          ...action.payload,
          favoriteSkills: action.payload.favoriteSkills || [],
        };
        state.currentUser = userWithFavorites;
      } else {
        state.currentUser = null;
      }
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // User profile actions
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    // Logout action
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
  },
});

export const {
  setAuthenticated,
  setUser,
  setTokens,
  clearTokens,
  setLoading,
  setError,
  updateUserProfile,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
