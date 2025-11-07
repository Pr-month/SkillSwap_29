import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jwtConfig } from '@/config/jwt.config';
import { appConfig } from '@/config/app.config';
import { IAppConfig, IJwtConfig } from '@/config/types';
import { Gender } from '@/enums/gender.enum';
import { UserRole } from '@/enums/roles.enum';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockJwtService: jest.Mocked<JwtService>;

  const mockJwtConfig: IJwtConfig = {
    accessSecret: 'test-access-secret',
    accessExpiresIn: '15m',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '7d',
  };

  const mockAppConfig: IAppConfig = {
    port: 3000,
    bcryptSalt: 10,
    env: 'test',
    host: 'localhost',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
        {
          provide: appConfig.KEY,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUserRepository = module.get(getRepositoryToken(User));
    mockJwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const mockUser = new User();
      mockUser.id = '123e4567-e89b-12d3-a456-426614174000';
      mockUser.email = registerDto.email;
      mockUser.name = registerDto.name;
      mockUser.password = 'hashed-password'; // This will be updated when we mock bcrypt
      mockUser.role = UserRole.USER;
      mockUser.gender = Gender.UNKNOWN;
      mockUser.refreshToken = '';

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      // Mock bcrypt.hash to return a predictable value
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      jest
        .spyOn(service as any, 'generateTokens')
        .mockResolvedValue(mockTokens);

      (mockUserRepository.create as jest.Mock).mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      // Check that bcrypt.hash was called with the right parameters
      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerDto.password,
        mockAppConfig.bcryptSalt,
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          name: registerDto.name,
          role: UserRole.USER,
          gender: Gender.UNKNOWN,
        }),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          gender: mockUser.gender,
          refreshToken: mockUser.refreshToken,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = new User();
      mockUser.id = '123e4567-e89b-12d3-a456-426614174000';
      mockUser.email = loginDto.email;
      mockUser.name = 'Test User';
      mockUser.password = 'hashed-password';
      mockUser.role = UserRole.USER;
      mockUser.gender = Gender.UNKNOWN;
      mockUser.refreshToken = 'hashed-refresh-token';

      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return true for the correct password
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      jest
        .spyOn(service as any, 'generateTokens')
        .mockResolvedValue(mockTokens);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: loginDto.email },
        }),
      );

      // Check that bcrypt.compare was called with the right parameters
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          gender: mockUser.gender,
          refreshToken: mockUser.refreshToken,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = new User();
      mockUser.id = userId;
      mockUser.email = 'test@example.com';
      mockUser.name = 'Test User';
      mockUser.refreshToken = 'hashed-refresh-token';

      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, refreshToken: '' };
      mockUserRepository.save = jest.fn().mockResolvedValue(updatedUser);

      await service.logout(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
        }),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockUser,
          refreshToken: '',
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const refreshToken = 'refresh-token';
      const hashedRefreshToken = 'hashed-refresh-token';

      const mockUser = new User();
      mockUser.id = userId;
      mockUser.email = 'test@example.com';
      mockUser.name = 'Test User';
      mockUser.role = UserRole.USER;
      mockUser.gender = Gender.UNKNOWN;
      mockUser.refreshToken = hashedRefreshToken;

      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return true for the correct refresh token
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      jest
        .spyOn(service as any, 'generateTokens')
        .mockResolvedValue(mockTokens);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
        }),
      );

      // Check that bcrypt.compare was called with the right parameters
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        hashedRefreshToken,
      );

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });
});