/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtWsGuard, AuthenticatedSocket } from '@/guards/ws-jwt.guard';
import { WsConfig, wsConfig } from '@/config/ws.config';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from '@/auth/types';
import { UserRole } from '@/enums/roles.enum';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtWsGuard: JwtWsGuard;
  let mockWsConfig: WsConfig;

  beforeEach(async () => {
    // Создаем mock конфигурации
    mockWsConfig = {
      notifications: {
        port: 3001,
        path: '/',
        cors: {
          origin: ['http://localhost:3000'],
          methods: ['GET', 'POST'],
          credentials: true,
        },
      },
    };

    // Создаем mock JwtWsGuard
    const mockJwtWsGuard = {
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: JwtWsGuard,
          useValue: mockJwtWsGuard,
        },
        {
          provide: wsConfig.KEY,
          useValue: mockWsConfig,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    jwtWsGuard = module.get<JwtWsGuard>(JwtWsGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should successfully connect authenticated client', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      // Mock успешной верификации
      jest.spyOn(jwtWsGuard, 'verify').mockImplementation((client) => {
        client.user = mockUser;
        return Promise.resolve(client);
      });

      // Act
      await gateway.handleConnection(mockClient, mockRequest);

      // Assert
      expect(jwtWsGuard.verify).toHaveBeenCalledWith(mockClient, mockRequest);
      expect(mockClient.user).toEqual(mockUser);
      expect(mockClient.close).not.toHaveBeenCalled();
    });

    it('should disconnect client on authentication failure', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      // Mock неудачной верификации
      jest
        .spyOn(jwtWsGuard, 'verify')
        .mockRejectedValue(new WsException('Токен аутентификации не найден'));

      // Act
      await gateway.handleConnection(mockClient, mockRequest);

      // Assert
      expect(jwtWsGuard.verify).toHaveBeenCalledWith(mockClient, mockRequest);
      expect(mockClient.close).toHaveBeenCalledWith(
        1008,
        'Ошибка аутентификации',
      );
    });

    it('should handle multiple client connections', async () => {
      // Arrange
      const mockUser1: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test1@example.com',
        role: UserRole.USER,
      };

      const mockUser2: JwtPayload = {
        sub: '223e4567-e89b-12d3-a456-426614174001' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test2@example.com',
        role: UserRole.USER,
      };

      const mockClient1 = {
        user: mockUser1,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockClient2 = {
        user: mockUser2,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      // Mock верификации
      jest
        .spyOn(jwtWsGuard, 'verify')
        .mockImplementationOnce((client) => {
          client.user = mockUser1;
          return Promise.resolve(client);
        })
        .mockImplementationOnce((client) => {
          client.user = mockUser2;
          return Promise.resolve(client);
        });

      // Act
      await gateway.handleConnection(mockClient1, mockRequest);
      await gateway.handleConnection(mockClient2, mockRequest);

      // Assert
      expect(jwtWsGuard.verify).toHaveBeenCalledTimes(2);
      expect(mockClient1.user).toEqual(mockUser1);
      expect(mockClient2.user).toEqual(mockUser2);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove authenticated client on disconnect', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      jest.spyOn(jwtWsGuard, 'verify').mockImplementation((client) => {
        client.user = mockUser;
        return Promise.resolve(client);
      });

      // Сначала подключаем клиента
      await gateway.handleConnection(mockClient, mockRequest);

      // Act
      gateway.handleDisconnect(mockClient);

      // Assert - клиент должен быть удален
      // Можно проверить через notifyUser - он не должен найти клиента
      const sendSpy = jest.fn();
      mockClient.send = sendSpy;

      gateway.notifyUser('123e4567-e89b-12d3-a456-426614174000', {
        type: 'NEW_REQUEST',
        message: 'Test',
        requestId: 'req-1',
        fromUser: { id: 'user-456', name: 'John' },
      });

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should handle disconnect of unauthenticated client', () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.CLOSED,
        close: jest.fn(),
      } as unknown as AuthenticatedSocket;

      // Act & Assert - не должно быть ошибок
      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('notifyUser', () => {
    it('should send notification to connected user', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
        send: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      jest.spyOn(jwtWsGuard, 'verify').mockImplementation((client) => {
        client.user = mockUser;
        return Promise.resolve(client);
      });

      // Подключаем клиента
      await gateway.handleConnection(mockClient, mockRequest);

      const payload = {
        type: 'NEW_REQUEST' as const,
        message: 'Test notification',
        requestId: 'req-123',
        fromUser: {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
        },
      };

      // Act
      gateway.notifyUser('123e4567-e89b-12d3-a456-426614174000', payload);

      // Assert
      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'notification', data: payload }),
      );
    });

    it('should not send notification to disconnected user', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.CLOSED,
        close: jest.fn(),
        send: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      jest.spyOn(jwtWsGuard, 'verify').mockImplementation((client) => {
        client.user = mockUser;
        return Promise.resolve(client);
      });

      await gateway.handleConnection(mockClient, mockRequest);

      const payload = {
        type: 'NEW_REQUEST' as const,
        message: 'Test notification',
        requestId: 'req-123',
        fromUser: {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
        },
      };

      // Act
      gateway.notifyUser('123e4567-e89b-12d3-a456-426614174000', payload);

      // Assert
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it('should handle notification for non-existent user', () => {
      // Arrange
      const payload = {
        type: 'NEW_REQUEST' as const,
        message: 'Test notification',
        requestId: 'req-123',
        fromUser: {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'John Doe',
        },
      };

      // Act & Assert - не должно быть ошибок
      expect(() =>
        gateway.notifyUser('999e4567-e89b-12d3-a456-426614174999', payload),
      ).not.toThrow();
    });

    it('should send different notification types', async () => {
      // Arrange
      const mockUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockClient = {
        user: mockUser,
        readyState: WebSocket.OPEN,
        close: jest.fn(),
        send: jest.fn(),
      } as unknown as AuthenticatedSocket;

      const mockRequest = {} as IncomingMessage;

      jest.spyOn(jwtWsGuard, 'verify').mockImplementation((client) => {
        client.user = mockUser;
        return Promise.resolve(client);
      });

      await gateway.handleConnection(mockClient, mockRequest);

      const notificationTypes = [
        'NEW_REQUEST',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
      ] as const;

      // Act & Assert
      notificationTypes.forEach((type) => {
        const payload = {
          type,
          message: `Test ${type}`,
          requestId: 'req-123',
          fromUser: {
            id: '223e4567-e89b-12d3-a456-426614174001',
            name: 'John Doe',
          },
        };

        gateway.notifyUser('123e4567-e89b-12d3-a456-426614174000', payload);

        expect(mockClient.send).toHaveBeenCalledWith(
          JSON.stringify({ event: 'notification', data: payload }),
        );
      });

      expect(mockClient.send).toHaveBeenCalledTimes(3);
    });
  });
});
