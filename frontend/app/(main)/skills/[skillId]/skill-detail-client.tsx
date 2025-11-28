'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import {
  useGetSkillByIdQuery,
  useGetUserByIdQuery,
} from '@/store/skillSwapApi/skillSwapApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Skill, User } from '@/store/types';

export function SkillDetailClient({
  skillId,
  initialData,
}: {
  skillId: string;
  initialData?: { skill: Skill; owner: User };
}) {
  const [isLiked, setIsLiked] = useState(false);

  // Check if skillId is valid
  const isValidSkillId = skillId && skillId !== 'undefined';

  const {
    data: skill,
    isLoading: isSkillLoading,
    isError: isSkillError,
  } = useGetSkillByIdQuery(skillId, {
    skip: !isValidSkillId, // Skip the query if skillId is invalid
  });

  // Get owner data from the skill object directly, since it's included in the API response
  const owner = skill?.owner;
  const isOwnerLoading = false;
  const isOwnerError = false;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Show not found page if skillId is invalid
  if (!isValidSkillId) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500">Навык не найден</h1>
          <p className="mt-2">К сожалению, запрашиваемый навык не найден.</p>
          <Button asChild className="mt-4">
            <Link href="/skills/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к каталогу
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isSkillLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSkillError || !skill) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500">Навык не найден</h1>
          <p className="mt-2">К сожалению, запрашиваемый навык не найден.</p>
          <Button asChild className="mt-4">
            <Link href="/skills/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к каталогу
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к каталогу
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{skill.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    Категория: {skill.category?.name || 'Не указана'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Создано:{' '}
                    {new Date(skill.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {skill.description ? (
                    <p className="text-lg">{skill.description}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Описание отсутствует
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                    />
                    В избранное
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Поделиться
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments section could be added here */}
          </div>

          {/* Sidebar with owner info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Владелец навыка</CardTitle>
              </CardHeader>
              <CardContent>
                {isOwnerLoading ? (
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </div>
                  </div>
                ) : owner ? (
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16 mb-4">
                      {owner.avatar ? (
                        <AvatarImage src={owner.avatar} alt={owner.name} />
                      ) : (
                        <AvatarFallback className="text-xl">
                          {getInitials(owner.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="text-xl font-semibold">{owner.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {owner.city || 'Город не указан'}
                    </p>
                    <Separator className="my-4" />
                    <div className="w-full space-y-2">
                      <Button className="w-full" asChild>
                        <Link href={`/users/${owner.id}`}>
                          Посмотреть профиль
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => console.log('Send message to', owner.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Написать
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    Информация о владельце недоступна
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Exchange button */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <Button className="w-full bg-[#abd27a] hover:bg-[#9bc26a] text-[#253017]">
                  Предложить обмен
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
