import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-yandex';
import { authConfig, AuthConfig } from '@/config/auth.config';
import { appConfig, AppConfig } from '@/config/app.config';

/**
 * Yandex Strategy для OAuth аутентификации
 *
 * Данная стратегия обрабатывает аутентификацию через Yandex OAuth.
 * Настраивает стратегию Yandex OAuth с учетными данными клиента
 * и URL обратного вызова, а также проверяет профиль пользователя, полученный от Yandex.
 *
 * @class YandexStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(
    @Inject(authConfig.KEY) private readonly authConf: AuthConfig,
    @Inject(appConfig.KEY) private readonly appConf: AppConfig,
  ) {
    super({
      clientID: authConf.yandexID,
      clientSecret: authConf.yandexSecret,
      callbackURL: `${appConf.corsOrigin}/auth/yandex/callback`,
    });
  }

  /**
   * Проверяет профиль Yandex OAuth и создает объект пользователя
   *
   * Этот метод извлекает информацию о пользователе из профиля Yandex
   * и создает стандартизированный объект пользователя с Yandex ID и email.
   *
   * @param accessToken - Access token Yandex OAuth
   * @param refreshToken - Refresh token Yandex OAuth
   * @param profile - Информация о профиле пользователя Yandex
   * @param done - Функция обратного вызова для передачи объекта пользователя
   * @returns Promise, разрешающийся в объект пользователя
   */
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): void {
    const { id, emails } = profile;
    const user = {
      yandexId: id,
      email: emails?.[0]?.value,
    };
    done(null, user);
  }
}
