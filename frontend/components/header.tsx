'use client';

import Link from 'next/link';
import { BellIcon, HeartIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Logo from '@/public/assets/logo.svg';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Notifications } from '@/components/notifications';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/user';
import { useLogoutMutation } from '@/store/skillSwapApi/skillSwapApi';

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const { isAuthenticated, currentUser } = useAppSelector(
    (state) => state.user,
  );

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());

      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logout()); // Still logout locally even if API fails

      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="flex items-center max-w-[1440px] mx-auto w-full sm:px-6 lg:px-8 p-9">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src={Logo} alt="SkillSwap" />
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/about"
              className="text-[#253017] transition-colors hover:text-foreground/80 font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px]"
            >
              О проекте
            </Link>
            <Link
              href="/skills"
              className="text-[#253017] transition-colors hover:text-foreground/80 font-['Roboto:Regular',sans-serif] text-[16px] tracking-[0.32px]"
            >
              Все навыки
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <InputGroup className="bg-white box-border content-stretch flex gap-[8px] items-center relative rounded-[12px] shrink-0">
              <InputGroupInput
                placeholder="Искать навык"
                className="font-['Roboto:Regular',sans-serif] text-[#69735d] text-[16px] tracking-[0.32px] flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
              <InputGroupButton
                aria-label="Search"
                className="text-sm shadow-none flex gap-2 items-center h-8 px-2.5 rounded-md has-[>svg]:px-2.5"
              >
                <SearchIcon className="size-[24px]" />
              </InputGroupButton>
            </InputGroup>
          </div>
          <nav className="flex items-center">
            <ThemeToggleButton
              className="size-[24px]"
              variant="ghost"
              size="icon"
            />

            {isAuthenticated ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-[24px] relative"
                    >
                      <BellIcon className="size-[24px]" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                        2
                      </span>
                      <span className="sr-only">Уведомления</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-2rem)] sm:w-[400px] p-0"
                    align="end"
                  >
                    <Notifications />
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" className="size-[24px]">
                  <HeartIcon className="size-[24px]" />
                  <span className="sr-only">Favorites</span>
                </Button>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
                  <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#253017] text-[16px] text-nowrap tracking-[0.32px]">
                    <p className="leading-[24px] whitespace-pre">
                      {currentUser?.name || 'Пользователь'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={currentUser?.avatar || '/assets/user.png'}
                            alt="User"
                          />
                          <AvatarFallback>
                            {currentUser?.name
                              ? currentUser.name.charAt(0).toUpperCase()
                              : 'П'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/account">Профиль</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Зарегистрироваться</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
