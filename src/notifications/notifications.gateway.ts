import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Inject, Logger } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { WsConfig, wsConfig } from '@/config/ws.config';
import { JwtWsGuard, AuthenticatedSocket } from '@/guards/ws-jwt.guard';

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

@WebSocketGateway(wsConfig().notifications.port, {
  path: wsConfig().notifications.path,
  cors: wsConfig().notifications.cors,
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, WebSocket>();

  constructor(
    private readonly jwtWsGuard: JwtWsGuard,
    @Inject(wsConfig.KEY) private readonly wsConf: WsConfig,
  ) {
    this.logger.log(
      `WebSocket Gateway инициализирован на порту: ${this.wsConf.notifications.port}`,
    );
  }

  async handleConnection(
    client: AuthenticatedSocket,
    request: IncomingMessage,
  ) {
    try {
      await this.jwtWsGuard.verify(client, request);
      const userId = client.user.sub;

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
}
