import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from '@/auth/types';
import { IJwtConfig } from '@/config/types';
import { jwtConfig } from '@/config/jwt.config';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import * as url from 'url';

// Расширяем стандартный интерфейс WebSocket, чтобы добавить свойство user
export interface AuthenticatedSocket extends WebSocket {
  user: JwtPayload;
}

@Injectable()
export class JwtWsGuard {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConf: IJwtConfig,
  ) {}

  async verify(
    client: AuthenticatedSocket,
    request: IncomingMessage,
  ): Promise<AuthenticatedSocket> {
    const token = this.getToken(request);
    if (!token) {
      throw new WsException('Токен аутентификации не найден');
    }

    client.user = await this.jwtService.verifyAsync(token, {
      secret: this.jwtConf.accessSecret,
    });
    return client;
  }

  private getToken(request: IncomingMessage): string | null {
    // Из заголовка
    const authHeader = request.headers['authorization'];
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }

    // Из query-параметра
    if (request.url) {
      const parsedUrl = url.parse(request.url, true);
      if (parsedUrl.query && typeof parsedUrl.query.token === 'string') {
        return parsedUrl.query.token;
      }
    }

    return null;
  }
}
