import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';
import Cookies from 'js-cookie';
import {
  setUser,
  setTokens,
  logout,
  setAuthenticated,
} from '@/store/user';
import {
  User,
  Skill,
  Category,
  RegisterResponse,
  RegisterDto,
  LoginDto,
  LoginResponse,
  RefreshResponse,
  PaginatedResponse,
  UsersQueryDto,
  UpdateUserDto,
  SkillsQueryDto,
  CreateSkillDto,
  UpdateSkillDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateRequestDto,
} from '@/store/types';

// Create a base query that handles token refresh
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).user.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include',
});

// Create a wrapper that handles token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Get the refresh token from the Redux store
    const refreshToken = (api.getState() as RootState).user.refreshToken;
    
    // If we don't have a refresh token, logout immediately
    if (!refreshToken) {
      Cookies.remove('accessToken');
      api.dispatch(logout());
      return result;
    }
    
    // Try to refresh the token with the refresh token in the Authorization header
    const refreshResult = await baseQuery(
      {
        url: 'auth/refresh',
        method: 'POST',
        headers: {
          authorization: `Bearer ${refreshToken}`,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Type guard to ensure we have the right structure
      const data = refreshResult.data as {
        accessToken?: string;
        refreshToken?: string;
      };

      if (data.accessToken && data.refreshToken) {
        // Store the new tokens in Redux store
        api.dispatch(
          setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }),
        );

        // Also set the accessToken in cookies for middleware authentication
        Cookies.set('accessToken', data.accessToken);

        // Retry the original request with updated authorization header
        const updatedArgs =
          typeof args === 'string'
            ? { url: args, headers: { authorization: `Bearer ${data.accessToken}` } }
            : {
                ...args,
                headers: {
                  ...args.headers,
                  authorization: `Bearer ${data.accessToken}`,
                },
              };

        // Retry the original request
        result = await baseQuery(updatedArgs, api, extraOptions);
      } else {
        // If refresh failed, remove cookies and logout the user
        Cookies.remove('accessToken');
        api.dispatch(logout());
      }
    } else {
      // If refresh failed, remove cookies and logout the user
      Cookies.remove('accessToken');
      api.dispatch(logout());
    }
  }

  return result;
};

export const skillSwapApi = createApi({
  reducerPath: 'skillSwapApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Skill', 'Category', 'Request'],
  endpoints: (builder) => ({
    // Auth endpoints
    register: builder.mutation<RegisterResponse, RegisterDto>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginDto>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          Cookies.set('accessToken', data.accessToken); // <-- Устанавливаем cookie
          dispatch(setUser(data.user));
          dispatch(
            setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }),
          );
          dispatch(setAuthenticated(true));
        } catch (_error) {
          // Можно обработать ошибку входа
          Cookies.remove('accessToken'); // <-- Удаляем cookie в случае ошибки
          console.error('Login failed:', _error);
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          Cookies.remove('accessToken');
          dispatch(logout());
        } catch {
          // Принудительно выходим из системы на клиенте, даже если запрос не удался
          Cookies.remove('accessToken');
          dispatch(logout());
        }
      },
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: 'auth/refresh',
        method: 'POST',
      }),
    }),
    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => 'users/me',
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}`,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query<PaginatedResponse<User>, UsersQueryDto | void>({
      query: (params) => {
        // Handle void case by providing empty params
        if (!params) {
          return 'users';
        }
        // Convert to record for fetchBaseQuery
        const queryParams: Record<string, string | number | boolean> = {};
        Object.keys(params).forEach((key) => {
          const value = params[key as keyof UsersQueryDto];
          if (value !== undefined) {
            queryParams[key] = value;
          }
        });
        return {
          url: 'users',
          params: queryParams,
        };
      },
    }),
    updateUser: builder.mutation<User, UpdateUserDto>({
      query: (data) => ({
        url: 'users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserAvatar: builder.mutation<User, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'users/me/avatar',
          method: 'POST',
          body: formData,
          // Не устанавливаем Content-Type, чтобы браузер сам добавил boundary
          headers: {},
        };
      },
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: 'users/me/password',
        method: 'PATCH',
        body: data,
      }),
    }),
    getUsersBySkillCategory: builder.query<User[], string>({
      query: (categoryId) => `users/by-skill/${categoryId}`,
    }),

    // Skill endpoints
    getAllSkills: builder.query<
      PaginatedResponse<Skill>,
      SkillsQueryDto | void
    >({
      query: (params) => {
        // Handle void case by providing empty params
        if (!params) {
          return 'skills';
        }
        // Convert to record for fetchBaseQuery
        const queryParams: Record<string, string | number | boolean> = {};
        Object.keys(params).forEach((key) => {
          const value = params[key as keyof SkillsQueryDto];
          if (value !== undefined) {
            queryParams[key] = value;
          }
        });
        return {
          url: 'skills',
          params: queryParams,
        };
      },
      providesTags: ['Skill'],
    }),
    getSkillById: builder.query<Skill, string>({
      query: (id) => `skills/${id}`,
      providesTags: ['Skill'],
    }),
    createSkill: builder.mutation<Skill, CreateSkillDto>({
      query: (skill) => ({
        url: 'skills',
        method: 'POST',
        body: skill,
      }),
      invalidatesTags: ['Skill'],
    }),
    updateSkill: builder.mutation<Skill, { id: string; data: UpdateSkillDto }>({
      query: ({ id, data }) => ({
        url: `skills/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Skill'],
    }),
    deleteSkill: builder.mutation<void, string>({
      query: (id) => ({
        url: `skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'],
    }),
    addSkillToFavorite: builder.mutation<void, string>({
      query: (id) => ({
        url: `skills/${id}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['Skill'],
    }),
    removeSkillFromFavorite: builder.mutation<void, string>({
      query: (id) => ({
        url: `skills/${id}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'],
    }),

    // Category endpoints
    getAllCategories: builder.query<Category[], void>({
      query: () => 'categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (category) => ({
        url: 'categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: string; data: UpdateCategoryDto }
    >({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Request endpoints
    createRequest: builder.mutation<Request, CreateRequestDto>({
      query: (request) => ({
        url: 'requests',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Request'],
    }),
    getIncomingRequests: builder.query<Request[], void>({
      query: () => 'requests/incoming',
      providesTags: ['Request'],
    }),
    getOutgoingRequests: builder.query<Request[], void>({
      query: () => 'requests/outgoing',
      providesTags: ['Request'],
    }),
    markRequestAsRead: builder.mutation<Request, string>({
      query: (id) => ({
        url: `requests/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Request'],
    }),
    acceptRequest: builder.mutation<Request, string>({
      query: (id) => ({
        url: `requests/${id}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Request'],
    }),
    rejectRequest: builder.mutation<Request, string>({
      query: (id) => ({
        url: `requests/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Request'],
    }),
    deleteRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Request'],
    }),

    // Added the getCategories endpoint that was in the original file
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
    }),
  }),
});

export const {
  // Auth hooks
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,

  // User hooks
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserAvatarMutation,
  useUpdatePasswordMutation,
  useGetUsersBySkillCategoryQuery,

  // Skill hooks
  useGetAllSkillsQuery,
  useGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useAddSkillToFavoriteMutation,
  useRemoveSkillFromFavoriteMutation,

  // Category hooks
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery, // Added this back

  // Request hooks
  useCreateRequestMutation,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useMarkRequestAsReadMutation,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useDeleteRequestMutation,
} = skillSwapApi;
