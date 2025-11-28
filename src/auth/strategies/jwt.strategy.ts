import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { AuthConfig, authConfig } from '@/config/auth.config';
import { JwtPayload } from '../types';

/**
 * JWT стратегия для валидации Access Token
 *
 * Данная стратегия проверяет JWT access tokens с использованием стратегии 'jwt' из Passport.
 * Извлекает токен из заголовка Authorization и проверяет его с помощью
 * настроенного секретного ключа. Валидные payload передаются в метод validate.
 *
 * @class JwtStrategy
 * @extends PassportStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfig: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.accessSecret,
    });
  }

  /**
   * Проверяет JWT payload
   *
   * Этот метод вызывается Passport после успешной проверки токена.
   * Просто возвращает payload, который будет прикреплен к объекту запроса.
   *
   * @param payload - Декодированный JWT payload
   * @returns JWT payload
   */
  validate(payload: JwtPayload) {
    return payload;
  }
}
