import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState, FilterState, PaginationState } from '@/store/types';

const initialState: AppState = {
  themeMode: 'system',
  sideBarCollapsed: false,
  filters: {
    search: '',
    category: null,
    location: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.themeMode = action.payload;
    },
    setSideBarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sideBarCollapsed = action.payload;
    },
    // Filter actions
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      // Reset to first page when search changes
      state.pagination.page = 1;
    },
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
      // Reset to first page when category changes
      state.pagination.page = 1;
    },
    setLocation: (state, action: PayloadAction<string | null>) => {
      state.filters.location = action.payload;
      // Reset to first page when location changes
      state.pagination.page = 1;
    },
    setSort: (state, action: PayloadAction<{ by: string; order: 'asc' | 'desc' }>) => {
      state.filters.sortBy = action.payload.by;
      state.filters.sortOrder = action.payload.order;
      // Reset to first page when sort changes
      state.pagination.page = 1;
    },
    // Pagination actions
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      // Reset to first page when limit changes
      state.pagination.page = 1;
    },
    setPagination: (state, action: PayloadAction<Omit<PaginationState, 'limit'>>) => {
      state.pagination.page = action.payload.page;
      state.pagination.total = action.payload.total;
      state.pagination.totalPages = action.payload.totalPages;
    },
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
  },
  selectors: {
    getThemeMode: (state) => state.themeMode,
    getSideBarCollapsed: (state) => state.sideBarCollapsed,
    getFilters: (state) => state.filters,
    getPagination: (state) => state.pagination,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
});

export const {
  setThemeMode,
  setSideBarCollapsed,
  setSearch,
  setCategory,
  setLocation,
  setSort,
  setPage,
  setLimit,
  setPagination,
  setLoading,
  setError,
  resetFilters,
} = appSlice.actions;

export const {
  getThemeMode,
  getSideBarCollapsed,
  getFilters,
  getPagination,
  getLoading,
  getError,
} = appSlice.selectors;

export default appSlice.reducer;