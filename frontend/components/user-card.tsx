'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const canTeachTags = ['Игра на барабанах'];
const wantsToLearnTags = ['Тайм менеджмент', 'Медитация', '+2'];

export interface UserCardProps {
  imageUrl?: string;
  name?: string;
  location?: string;
  age?: number;
  canTeach?: string[];
  wantsToLearn?: string[];
}

export function UserCard({
  imageUrl = '/assets/user.png',
  name = 'Иван',
  location = 'Санкт-Петербург',
  age = 34,
  canTeach = canTeachTags,
  wantsToLearn = wantsToLearnTags,
}: UserCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="w-full max-w-[324px] rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="relative flex items-center gap-3">
          <Avatar className="size-24">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {location}, {age} года
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            aria-label="Like user"
          >
            <Heart className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-foreground">Может научить:</p>
            <div className="flex flex-wrap items-center gap-1">
              {canTeach.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-[#ebe5c5] text-[#253017]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-foreground">Хочет научиться:</p>
            <div className="flex flex-wrap items-center gap-1">
              {wantsToLearn.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-[#e7f2f6] text-[#253017]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Подробнее</Button>
      </div>
    </div>
  );
}

export default UserCard;