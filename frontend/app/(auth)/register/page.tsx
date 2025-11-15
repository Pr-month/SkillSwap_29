'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

export default function RegistrationStep1() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <p className="text-2xl font-medium tracking-tighter">Шаг 1 из 3</p>
          <Progress value={33.33} className="h-1 w-[212px]" />
        </div>

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
                <form className="flex flex-col gap-4">
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="email"
                        type="email"
                        placeholder="Введите email"
                      />
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Пароль</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="password"
                        type="password"
                        placeholder="Придумайте надёжный пароль"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Показать пароль"
                        >
                          <EyeIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Пароль должен содержать не менее 8 знаков
                    </FieldDescription>
                  </Field>
                </form>
              </div>
              <Button type="submit" size="lg">
                Далее
              </Button>
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
                  Присоединяйтесь к SkillSwap и обменивайтесь знаниями и
                  навыками с другими людьми
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
