import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Inject, Logger } from '@nestjs/common';
import { JwtPayload } from '@/auth/types';
import { JwtService } from '@nestjs/jwt';
import { IJwtConfig } from '@/config/types';
import { jwtConfig } from '@/config/jwt.config';
import * as url from 'url';
import { IncomingMessage } from 'http';

// Расширяем стандартный интерфейс WebSocket, чтобы добавить свойство user
interface AuthenticatedSocket extends WebSocket {
  user: JwtPayload;
}

// Определяем структуру объекта уведомления для строгой типизации
export interface NotificationPayload {
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED';
  message: string;
  requestId: string;
  fromUser: {
    id: string;
    name: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, WebSocket>();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY) private readonly jwtConf: IJwtConfig,
  ) {}

  async handleConnection(
    client: AuthenticatedSocket,
    request: IncomingMessage,
  ) {
    try {
      const token = this.getToken(request);
      if (!token) {
        throw new Error('Токен аутентификации не найден');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConf.accessSecret,
      });

      client.user = payload;
      const userId = payload.sub;

      this.connectedClients.set(userId, client);
      this.logger.log(
        `Клиент подключен: ${userId}. Всего подключено: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error(
        `Ошибка аутентификации WebSocket: ${(error as Error).message}`,
      );
      client.close(1008, 'Ошибка аутентификации');
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user && client.user.sub) {
      const userId = client.user.sub;
      this.connectedClients.delete(userId);
      this.logger.log(
        `Клиент отключен: ${userId}. Всего подключено: ${this.connectedClients.size}`,
      );
    } else {
      this.logger.log('Неаутентифицированный клиент отключился.');
    }
  }

  notifyUser(userId: string, payload: NotificationPayload) {
    const client = this.connectedClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: 'notification', data: payload }));
      this.logger.log(
        `Отправлено уведомление пользователю ${userId}, тип: ${payload.type}`,
      );
    } else {
      this.logger.warn(
        `Попытка отправить уведомление отключенному пользователю: ${userId}`,
      );
    }
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
