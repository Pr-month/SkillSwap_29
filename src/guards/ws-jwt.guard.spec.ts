/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtWsGuard, AuthenticatedSocket } from './ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { jwtConfig } from '@/config/jwt.config';
import { IJwtConfig } from '@/config/types';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { JwtPayload } from '@/auth/types';
import { UserRole } from '@/enums/roles.enum';

describe('JwtWsGuard', () => {
  let guard: JwtWsGuard;
  let jwtService: JwtService;
  let mockJwtConfig: IJwtConfig;

  beforeEach(async () => {
    // Mock JWT конфигурации
    mockJwtConfig = {
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    };

    // Mock JwtService
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtWsGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    guard = module.get<JwtWsGuard>(JwtWsGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('verify', () => {
    it('should verify token from Authorization header', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        url: '/',
      } as IncomingMessage;

      const mockPayload: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'test@example.com',
        role: UserRole.USER,
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      // Act
      const result = await guard.verify(mockClient, mockRequest);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: mockJwtConfig.accessSecret,
      });
      expect(result.user).toEqual(mockPayload);
      expect(mockClient.user).toEqual(mockPayload);
    });

    it('should verify token from query parameter', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {},
        url: '/?token=valid-query-token',
      } as IncomingMessage;

      const mockPayload: JwtPayload = {
        sub: '223e4567-e89b-12d3-a456-426614174001' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'query@example.com',
        role: UserRole.USER,
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      // Act
      const result = await guard.verify(mockClient, mockRequest);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-query-token', {
        secret: mockJwtConfig.accessSecret,
      });
      expect(result.user).toEqual(mockPayload);
    });

    it('should throw WsException when token is missing', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {},
        url: '/',
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        'Токен аутентификации не найден',
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw WsException when Authorization header is malformed', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
        url: '/',
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw WsException when Authorization header has no Bearer prefix', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'some-token',
        },
        url: '/',
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw error when token verification fails', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
        url: '/',
      } as IncomingMessage;

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Token expired'));

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        'Token expired',
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', {
        secret: mockJwtConfig.accessSecret,
      });
    });

    it('should prefer Authorization header over query parameter', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'Bearer header-token',
        },
        url: '/?token=query-token',
      } as IncomingMessage;

      const mockPayload: JwtPayload = {
        sub: '323e4567-e89b-12d3-a456-426614174002' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'header@example.com',
        role: UserRole.USER,
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      // Act
      await guard.verify(mockClient, mockRequest);

      // Assert
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('header-token', {
        secret: mockJwtConfig.accessSecret,
      });
      expect(jwtService.verifyAsync).not.toHaveBeenCalledWith('query-token', {
        secret: mockJwtConfig.accessSecret,
      });
    });

    it('should handle different user roles', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'Bearer admin-token',
        },
        url: '/',
      } as IncomingMessage;

      const mockPayload: JwtPayload = {
        sub: '423e4567-e89b-12d3-a456-426614174003' as `${string}-${string}-${string}-${string}-${string}`,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      // Act
      const result = await guard.verify(mockClient, mockRequest);

      // Assert
      expect(result.user.role).toBe('ADMIN');
      expect(mockClient.user).toEqual(mockPayload);
    });

    it('should handle URL without query parameters', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {},
        url: undefined,
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
    });

    it('should handle empty Bearer token', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
        url: '/',
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should handle query parameter with empty token', async () => {
      // Arrange
      const mockClient = {} as AuthenticatedSocket;
      const mockRequest = {
        headers: {},
        url: '/?token=',
      } as IncomingMessage;

      // Act & Assert
      await expect(guard.verify(mockClient, mockRequest)).rejects.toThrow(
        WsException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });
});
