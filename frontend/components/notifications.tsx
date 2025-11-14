'use client';

import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface Notification {
  title: string;
  description: string;
  time: string;
  hasButton?: boolean;
}

const newNotifications: Notification[] = [
  {
    title: 'Николай принял ваш обмен',
    description: 'Перейдите в профиль, чтобы обсудить детали',
    time: 'сегодня',
    hasButton: true,
  },
  {
    title: 'Татьяна предлагает вам обмен',
    description: 'Примите обмен, чтобы обсудить детали',
    time: 'сегодня',
    hasButton: true,
  },
];

const viewedNotifications: Notification[] = [
  {
    title: 'Олег предлагает вам обмен',
    description: 'Примите обмен, чтобы обсудить детали',
    time: 'вчера',
  },
  {
    title: 'Игорь принял ваш обмен',
    description: 'Перейдите в профиль, чтобы обсудить детали',
    time: '23 мая',
  },
];

export function Notifications() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-background border rounded-xl p-6 sm:p-10 flex flex-col gap-10">
      <section className="flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-medium text-foreground">
            Новые уведомления
          </h2>
          <Button
            variant="link"
            className="text-base font-medium text-primary p-0 h-auto"
          >
            Прочитать все
          </Button>
        </header>
        <div className="flex flex-col gap-6">
          {newNotifications.map((notification, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div className="flex justify-between items-start gap-5">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 size-10 flex items-center justify-center bg-muted rounded-full">
                    <Lightbulb className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-base text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <span className="text-base text-muted-foreground whitespace-nowrap">
                  {notification.time}
                </span>
              </div>
              {notification.hasButton && (
                <Button className="self-start">Перейти</Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl font-medium text-foreground">
            Просмотренные
          </h2>
          <Button
            variant="link"
            className="text-base font-medium text-primary p-0 h-auto"
          >
            Очистить
          </Button>
        </header>
        <div className="flex flex-col gap-6">
          {viewedNotifications.map((notification, index) => (
            <div key={index} className="flex justify-between items-start gap-5">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 size-10 flex items-center justify-center bg-muted rounded-full">
                  <Lightbulb className="size-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="text-base text-foreground">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
              <span className="text-base text-muted-foreground whitespace-nowrap">
                {notification.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
