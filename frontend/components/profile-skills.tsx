'use client';

import { useGetCurrentUserQuery } from '@/store/skillSwapApi/skillSwapApi';
import { Skill } from '@/store/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkills() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 lg:p-[60px]">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border bg-background p-6 lg:p-[60px]">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Ошибка загрузки навыков</p>
        </div>
      </div>
    );
  }

  const userSkills = user.skills || [];

  return (
    <div className="rounded-2xl border bg-background p-6 lg:p-[60px]">
      <h2 className="text-2xl font-bold mb-6">Мои навыки</h2>

      {userSkills.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            У вас пока нет добавленных навыков
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userSkills.map((skill: Skill) => (
            <Card
              key={skill.id}
              className="w-full hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">
                  {skill.title}
                </CardTitle>
                {skill.category && (
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {skill.category.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {skill.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {skill.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Описание отсутствует
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Создано:{' '}
                  {new Date(skill.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
