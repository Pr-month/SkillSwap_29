import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { authConfig, AuthConfig } from '@/config/auth.config';
import { appConfig, AppConfig } from '@/config/app.config';

/**
 * Google Strategy для OAuth аутентификации
 *
 * Данная стратегия обрабатывает аутентификацию через Google OAuth2.
 * Настраивает стратегию Google OAuth2 с учетными данными клиента
 * и URL обратного вызова, а также проверяет профиль пользователя, полученный от Google.
 *
 * @class GoogleStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(authConfig.KEY) private readonly authConf: AuthConfig,
    @Inject(appConfig.KEY) private readonly appConf: AppConfig,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || authConf.googleID || '',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || authConf.googleSecret || '',
      callbackURL: `${appConf.corsOrigin}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Проверяет профиль Google OAuth и создает объект пользователя
   *
   * Этот метод извлекает информацию о пользователе из профиля Google
   * и создает стандартизированный объект пользователя с Google ID, email,
   * именем, фамилией и фотографией профиля.
   *
   * @param accessToken - Access token Google OAuth
   * @param refreshToken - Refresh token Google OAuth
   * @param profile - Информация о профиле пользователя Google
   * @param done - Функция обратного вызова для передачи объекта пользователя
   * @returns Promise, разрешающийся в объект пользователя
   */
  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): void {
    const { id, name, emails, photos } = profile as {
      id: string;
      name: { givenName?: string; familyName?: string };
      emails?: Array<{ value?: string }>;
      photos?: Array<{ value?: string }>;
    };
    const user = {
      googleId: id,
      email: emails?.[0]?.value ?? '',
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      picture: photos?.[0]?.value ?? '',
    };
    done(null, user);
  }
}
