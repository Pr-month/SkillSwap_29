import { skillSwapApi } from './skillSwapApi';
import type { User, PaginatedResponse, PaginationParams } from './types';
import { UpdateUserDto, UsersQueryDto } from '@/store/types';

export const userApi = skillSwapApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

// Экспортируем хуки
export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserAvatarMutation,
  useUpdatePasswordMutation,
  useGetUsersBySkillCategoryQuery,
} = userApi;
