import { skillSwapApi } from './skillSwapApi';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from './types';

export const authApi = skillSwapApi.injectEndpoints({
  endpoints: (builder) => ({
    // Вход в систему
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Инвалидируем тег пользователя при успешном входе
      invalidatesTags: ['User'],
    }),

    // Регистрация
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Выход из системы
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      // Очищаем кеш при выходе
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Очищаем теги при выходе
          dispatch(authApi.util.invalidateTags(['User']));
        } catch {
          // В любом случае очищаем теги
          dispatch(authApi.util.invalidateTags(['User']));
        }
      },
    }),

    // Обновление токена
    refresh: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    // Получение текущего пользователя
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
} = authApi;
