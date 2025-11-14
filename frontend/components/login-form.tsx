'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { FieldSeparator } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { EyeIcon } from 'lucide-react';
import AppleIcon from '@/public/assets/apple-icon.svg';
import GoogleIcon from '@/public/assets/google-icon.svg';
import LightbulbIcon from '@/public/assets/light-bulb.svg';
import { useLoginMutation } from '@/store/skillSwapApi/skillSwapApi';
import { useAppDispatch } from '@/store';
import { setAuthenticated, setTokens, setUser } from '@/store/user';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();

      // Update store with user data and tokens
      dispatch(setAuthenticated(true));
      dispatch(
        setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      );
      dispatch(setUser(result.user));

      // Redirect to account page
      router.push('/account');
    } catch (error) {
      console.error('Login failed:', error);
      // Here you would typically show an error message to the user
      // For now, we'll just log it
    }
  };

  return (
    <div className="flex w-full flex-col items-center bg-background text-foreground">
      <main className="mt-8 flex w-full max-w-[1136px] flex-col items-stretch gap-6 lg:flex-row">
        <div className="w-full rounded-xl bg-card p-8 shadow-sm sm:p-12 md:p-16 lg:w-1/2">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" size="lg">
                  <Image
                    width={24}
                    height={24}
                    alt="GoogleIcon"
                    src={GoogleIcon}
                    className="mr-3 size-6"
                  />
                  Продлжить с Google
                </Button>
                <Button variant="outline" size="lg">
                  <Image
                    width={24}
                    height={24}
                    alt="AppleIcon"
                    src={AppleIcon}
                    className="mr-3 size-6"
                  />
                  Продлжить с Apple
                </Button>
              </div>
              <FieldSeparator>или</FieldSeparator>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="email"
                      type="email"
                      placeholder="Введите email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Пароль</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Придумайте надёжный пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Показать пароль"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <EyeIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Пароль должен содержать не менее 8 знаков
                  </FieldDescription>
                </Field>
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? 'Вход...' : 'Далее'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden w-full items-center justify-center rounded-xl bg-card p-16 shadow-sm lg:flex lg:w-1/2">
          <div className="flex max-w-sm flex-col items-center gap-10 text-center">
            <Image
              width={556}
              height={692}
              alt="LightbulbIcon"
              src={LightbulbIcon}
              className="size-48 text-muted-foreground"
            />
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-medium tracking-tighter">
                Добро пожаловать в SkillSwap!
              </h1>
              <p className="text-muted-foreground">
                Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками
                с другими людьми
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
