import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  HttpExceptionOptions,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { jwtConfig as jwt } from 'src/config/jwt.config';
import { IJwtConfig } from 'src/config/types';
import { RequestWithUser } from '@/auth/guards/jwt-auth.guard';
import { UserPayload } from '@/auth/guards/roles.guard';
import { isUUID } from 'class-validator';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(jwt.KEY)
    private readonly jwtConfig: IJwtConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Получаем типизированный объект запроса
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // 2. Извлекаем токен из заголовка
    const refreshToken = this.extractTokenFromHeader(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing or malformed');
    }

    try {
      // 3. Верифицируем токен
      const payload = await this.jwtService.verifyAsync<UserPayload>(
        refreshToken,
        {
          secret: this.jwtConfig.refreshSecret,
        },
      );

      // Проверяем структуру payload
      if (!payload || typeof payload !== 'object' || !('sub' in payload)) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Проверяем формат UUID
      if (typeof payload.sub !== 'string' || !isUUID(payload.sub, '4')) {
        throw new UnauthorizedException('Invalid user ID format');
      }

      // Ищем пользователя в базе
      const user = await this.userRepository.findOne({
        where: { id: payload.sub } as FindOptionsWhere<User>,
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      // Сравниваем токен с хэшем из БД
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Присваиваем данные пользователя в запрос
      request.user = user;
      request.token = refreshToken;

      return true;
    } catch (error) {
      // Обрабатываем ошибки верификации и другие ошибки
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
        error as HttpExceptionOptions,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
