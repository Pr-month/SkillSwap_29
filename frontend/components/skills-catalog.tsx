'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { useGetAllUsersQuery, useGetCurrentUserQuery } from '@/store/skillSwapApi/skillSwapApi';
import { getFilters, getPagination, setPage } from '@/store/app';
import { SkillCard } from '@/components/skill-card';
import { Skeleton } from '@/components/ui/skeleton';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { User } from '@/store/types';
import { useRouter } from 'next/navigation';

interface SkillsCatalogProps {
  limit?: number;
  title?: string;
  showTitle?: boolean;
}

// Helper function to extract error message
const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string => {
  if (!error) return 'Неизвестная ошибка';

  if ('status' in error) {
    // FetchBaseQueryError
    return typeof error.data === 'string' ? error.data : 'Ошибка запроса';
  } else {
    // SerializedError
    return error.message || 'Неизвестная ошибка';
  }
};

export function SkillsCatalog({
  limit = 9,
  title = 'Каталог навыков',
  showTitle = true,
}: SkillsCatalogProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(getFilters);
  const pagination = useAppSelector(getPagination);
  const router = useRouter();

  // Fetch current user to get their favorite skills
  const { data: currentUser, refetch: refetchCurrentUser } = useGetCurrentUserQuery();
  
  // Use the limit from props or from pagination state
  const effectiveLimit = limit || pagination.limit;

  // Fetch users with current filters and pagination
  const { data, isLoading, isError, error } = useGetAllUsersQuery({
    page: pagination.page,
    limit: effectiveLimit,
    search: filters.search || undefined,
  });

  // Reset to first page when filters change
  useEffect(() => {
    dispatch(setPage(1));
  }, [filters, dispatch]);

  if (isError) {
    return (
      <div className="w-full py-8 text-center">
        {/*<p className="text-red-500">*/}
        {/*  Ошибка загрузки каталога: {getErrorMessage(error)}*/}
        {/*</p>*/}
        <p className="test-foreground">Навыков не надено</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <h2 className="text-2xl font-bold mb-4 text-foreground">{title}</h2>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: effectiveLimit }).map((_, index) => (
            <div
              key={index}
              className="bg-white box-border content-stretch flex flex-col gap-[20px] items-start p-[20px] relative rounded-[12px] size-full border border-solid border-[#abd27a]"
            >
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
                <Skeleton className="content-stretch flex gap-[10px] items-center justify-center overflow-clip relative rounded-[100px] shrink-0 size-[100px]" />
                <div className="basis-0 content-stretch flex flex-col gap-[4px] grow items-start justify-center leading-[0] min-h-px min-w-px relative shrink-0">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="absolute overflow-clip right-0 size-[24px] top-0 rounded-full" />
              </div>
              <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                  <Skeleton className="h-6 w-32" />
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full flex-wrap">
                    <Skeleton className="h-8 w-20 rounded-[20px]" />
                    <Skeleton className="h-8 w-24 rounded-[20px]" />
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                  <Skeleton className="h-6 w-40" />
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full flex-wrap">
                    <Skeleton className="h-8 w-24 rounded-[20px]" />
                    <Skeleton className="h-8 w-20 rounded-[20px]" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-[12px]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((user: User) => (
            <SkillCard
              key={user.id}
              user={user}
              currentUser={currentUser || null} // Pass current user to determine favorite status
              isExchangeProposed={false}
              onViewDetails={(skillId) => {
                // Navigate to skill detail page when onViewDetails is called (it passes skill ID)
                router.push(`/skills/${skillId}`);
              }}
              onLike={async (userId) => {
                // Refetch current user data to update favorite status
                await refetchCurrentUser();
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination controls could be added here if needed */}
    </div>
  );
}