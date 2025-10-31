import { RefreshTokenGuard } from './refresh-token.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { IJwtConfig } from '@/config/types';

jest.mock('bcrypt');

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  const mockJwtConfig: IJwtConfig = {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    userRepository = { findOne: jest.fn() } as any;
    guard = new RefreshTokenGuard(jwtService, userRepository, mockJwtConfig);
    jest.clearAllMocks();
  });

  const createMockContext = (authHeader?: string) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: authHeader },
        }),
      }),
    } as any;
  };

  it('Выбрасывает UnauthorizedException если заголовок Authorization отсутствует.', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException если токен отсутствует после Bearer.', async () => {
    const context = createMockContext('Bearer');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException при неверном JWT.', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid'));
    const context = createMockContext('Bearer invalidToken');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException если пользователь не найден.', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-id' });
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    const context = createMockContext('Bearer validToken');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException если refreshToken пользователя отсутствует.', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-id' });
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 'user-id', refreshToken: null });

    const context = createMockContext('Bearer validToken');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException если токен не совпадает.', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-id' });
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 'user-id', refreshToken: 'hashed' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const context = createMockContext('Bearer validToken');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('Успешно активирует guard при валидном токене.', async () => {
    const user = { id: 'user-id', refreshToken: 'hashed-token', email: 'test@example.com' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: user.id });
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const request: any = { headers: { authorization: 'Bearer validToken' } };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user).toEqual(user);
    expect(request.token).toBe('validToken');
  });
});
