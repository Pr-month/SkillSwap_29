import { skillSwapApi } from './skillSwapApi';
import type {
  Request,
  PaginatedResponse,
  PaginationParams,
  CreateRequestDto,
  UpdateRequestDto,
} from './types';

export const requestsApi = skillSwapApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useCreateRequestMutation,
  useGetIncomingRequestsQuery,
  useGetOutgoingRequestsQuery,
  useMarkRequestAsReadMutation,
  useAcceptRequestMutation,
  useRejectRequestMutation,
  useDeleteRequestMutation,
} = requestsApi;
