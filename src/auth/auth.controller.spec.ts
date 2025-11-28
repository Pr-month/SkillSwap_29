import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { jwtConfig } from '@/config/jwt.config';
import { User } from '@/entities/user.entity';
import { JwtPayload } from './types';
import { UserRole } from '@/enums/roles.enum';
import { RefreshRequest, AuthRequest } from './types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [jwtConfig],
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: RefreshTokenGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RefreshTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with the provided DTO', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        wantToLearn: '123e4567-e89b-12d3-a456-426614174000',
      };
      const registerSpy = jest
        .spyOn(authService, 'register')
        .mockResolvedValueOnce({} as any);

      await controller.register(registerDto);
      expect(registerSpy).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with the provided DTO', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginSpy = jest
        .spyOn(authService, 'login')
        .mockResolvedValueOnce({} as any);

      await controller.login(loginDto);
      expect(loginSpy).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens with the refresh token from request', async () => {
      const mockUser = new User();
      mockUser.id = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID
      const refreshToken = 'refresh-token';

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      const refreshSpy = jest
        .spyOn(authService, 'refreshTokens')
        .mockResolvedValueOnce(mockTokens);

      // Create proper RefreshRequest mock
      const req: RefreshRequest = {
        user: mockUser,
        token: refreshToken,
      } as unknown as RefreshRequest;

      const result = await controller.refresh(req);

      expect(refreshSpy).toHaveBeenCalledWith(mockUser.id, refreshToken);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with the user ID from request', async () => {
      const mockJwtPayload: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: UserRole.USER, // Correct enum value
      };

      const logoutSpy = jest
        .spyOn(authService, 'logout')
        .mockResolvedValueOnce(undefined);

      // Create proper AuthRequest mock
      const req: AuthRequest = {
        user: mockJwtPayload,
      } as unknown as AuthRequest;

      await controller.logout(req);

      expect(logoutSpy).toHaveBeenCalledWith(mockJwtPayload.sub);
    });
  });
});
