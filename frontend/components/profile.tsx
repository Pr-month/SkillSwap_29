'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileTextIcon,
  MessageSquareTextIcon,
  HeartIcon,
  LightbulbIcon,
  UserIcon,
} from 'lucide-react';
import ProfilePersonal from './profile-personal';
import ProfileRequests from './profile-requests';
import ProfileExchanges from './profile-exchanges';
import ProfileFavorites from './profile-favorites';
import ProfileSkills from './profile-skills';

const tabItems = [
  {
    id: 'requests',
    label: 'Заявки',
    icon: FileTextIcon,
    component: ProfileRequests,
  },
  {
    id: 'exchanges',
    label: 'Мои обмены',
    icon: MessageSquareTextIcon,
    component: ProfileExchanges,
  },
  {
    id: 'favorites',
    label: 'Избранное',
    icon: HeartIcon,
    component: ProfileFavorites,
  },
  {
    id: 'skills',
    label: 'Мои навыки',
    icon: LightbulbIcon,
    component: ProfileSkills,
  },
  {
    id: 'profile',
    label: 'Личные данные',
    icon: UserIcon,
    component: ProfilePersonal,
  },
];

export default function Profile() {
  return (
    <div className="min-h-screen w-full bg-muted/40">
      <div className="container mx-auto p-4 md:p-6">
        <Tabs
          defaultValue="profile"
          className="flex flex-col lg:flex-row"
          orientation="vertical"
        >
          <div className="overflow-x-auto lg:overflow-visible lg:w-64 flex lg:flex-col mb-4 lg:mb-0 lg:mr-8">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 lg:flex-col lg:items-stretch gap-2">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex items-center gap-3 rounded-none px-4 py-3 text-base font-normal transition-colors data-[state=active]:bg-[#DEEBC5] data-[state=active]:text-foreground lg:w-full justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1">
            {tabItems.map((item) => {
              const Component = item.component;
              return (
                <TabsContent key={item.id} value={item.id} className="mt-0">
                  <Component />
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
