/**
 * Стратегия обновления токена (Refresh Token)
 *
 * Данная стратегия проверяет JWT refresh tokens с использованием стратегии 'refresh' из Passport.
 * Извлекает refresh token из HTTP-only cookies и проверяет его с помощью
 * настроенного секретного ключа. Также проверяет, что refresh token соответствует
 * хешированному токену, хранящемуся в базе данных для пользователя.
 *
 * @class RefreshStrategy
 * @extends PassportStrategy
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../types';
import { User } from '@/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request || !request.cookies) {
            return null;
          }
          return (request.cookies['refreshToken'] as string) || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh_secret_default',
      passReqToCallback: true,
    });
  }

  /**
   * Проверяет refresh token и связанного с ним пользователя
   *
   * Этот метод проверяет refresh token следующим образом:
   * 1. Проверяет структуру payload и формат ID пользователя
   * 2. Извлекает refresh token из cookies
   * 3. Находит пользователя в базе данных
   * 4. Сравнивает токен с хешированным токеном из базы данных
   *
   * @param req - Объект запроса Express, содержащий cookies
   * @param payload - JWT payload с информацией о пользователе
   * @returns Promise, разрешающийся в объект пользователя при успешной проверке
   * @throws UnauthorizedException если проверка не пройдена на любом из этапов
   */
  async validate(req: Request, payload: JwtPayload) {
    // Проверяем структуру payload
    if (!payload || typeof payload !== 'object' || !('sub' in payload)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Проверяем формат UUID (более лояльная проверка для seed данных)
    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedException('Invalid user ID format');
    }

    // Для seed данных используем более лояльную проверку
    // В production следует использовать строгую проверку UUID
    const userId = payload.sub;
    if (!userId || userId.length !== 36) {
      throw new UnauthorizedException('Invalid user ID format');
    }

    // Извлекаем токен из cookie
    if (!req.cookies || !req.cookies['refreshToken']) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = req.cookies['refreshToken'] as string;

    // Ищем пользователя в базе
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token not set for user');
    }

    // Сравниваем токен с хэшем из БД
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Создаем новый объект пользователя с refreshToken
    // чтобы избежать мутации исходного объекта
    return {
      ...user,
      refreshToken,
    };
  }
}
