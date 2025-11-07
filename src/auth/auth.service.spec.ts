import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from '@/entities/user.entity';
import { jwtConfig } from '@/config/jwt.config';
import { appConfig } from '@/config/app.config';
import { IJwtConfig, IAppConfig } from '@/config/types';
import { UserRole, Gender } from '@/enums';
import { QueryFailedError } from 'typeorm';

jest.mock('bcrypt');

describe('AuthService (unit)', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test',
    gender: Gender.UNKNOWN,
    about: '',
    avatar: '',
    birthdate: new Date('2004-05-10'),
    city: '',
    role: UserRole.USER,
    refreshToken: '',
    skills: [],
    favoriteSkills: [],
  };

  const mockJwtConfig: IJwtConfig = {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  };

  const mockAppConfig: IAppConfig = {
    env: 'test',
    host: 'localhost',
    port: 3000,
    bcryptSalt: 10,
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: jwtConfig.KEY, useValue: mockJwtConfig },
        { provide: appConfig.KEY, useValue: mockAppConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('Успешно регистрирует пользователя.', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');
      mockUserRepo.create.mockImplementation((dto) => ({
        ...dto,
        id: 'some-uuid',
        refreshToken: '',
        skills: [],
        favoriteSkills: [],
      }));
      mockUserRepo.save.mockImplementation(async (user) => user);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');
      jest.spyOn(service, 'updateRefreshToken').mockResolvedValue(undefined);

      const dto = { email: 'new@example.com', password: '12345', name: 'New' };
      const result = await service.register(dto as any);

      expect(result.user.email).toBe(dto.email);
      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
    });

    it('Выбрасывает ConflictException если email уже существует.', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserRepo.create.mockImplementation((dto) => ({ ...dto } as any));

      const err = new QueryFailedError('sql', [], new Error('duplicate'));
      (err as any).code = '23505';
      mockUserRepo.save.mockRejectedValue(err);

      await expect(
        service.register({ email: 'test@example.com', password: '123', name: 'T' } as any)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('Успешно логинит при корректных данных.', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');
      jest.spyOn(service, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.login({ email: mockUser.email, password: '12345' } as any);

      expect(result.accessToken).toBe('accessToken');
      expect(result.refreshToken).toBe('refreshToken');
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith('12345', mockUser.password);
    });

    it('Выбрасывает UnauthorizedException если пользователь не найден.', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: '12345' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Выбрасывает UnauthorizedException если пароль неверный.', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('Успешно обновляет токены при валидном refreshToken.', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, refreshToken: 'storedHash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken');
      mockJwtService.signAsync.mockResolvedValueOnce('refreshToken');
      jest.spyOn(service, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.refreshTokens(mockUser.id as any, 'refreshToken');

      expect(result).toHaveProperty('accessToken', 'accessToken');
      expect(result).toHaveProperty('refreshToken', 'refreshToken');
    });

    it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshTokens(mockUser.id as any, 'invalid'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('Успешно очищает refreshToken.', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      await service.logout(mockUser.id as any);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: mockUser.id } });
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ refreshToken: '' }));
    });

    it('Выбрасывает BadRequestException если пользователь не найден.', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.logout('bad-id' as any)).rejects.toThrow(BadRequestException);
    });
  });
});