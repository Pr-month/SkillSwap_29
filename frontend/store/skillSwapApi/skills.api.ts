import { skillSwapApi } from './skillSwapApi';
import type {
  Skill,
  PaginatedResponse,
  PaginationParams,
  CreateSkillDto,
  UpdateSkillDto,
} from './types';
import { SkillsQueryDto } from '@/store/types';

export const skillsApi = skillSwapApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetAllSkillsQuery,
  useGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useAddSkillToFavoriteMutation,
  useRemoveSkillFromFavoriteMutation,
} = skillsApi;
