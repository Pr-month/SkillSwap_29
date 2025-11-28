import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtConfig } from '@/config/types';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtConfig: IJwtConfig = {
    accessSecret: 'access-secret',
    refreshSecret: 'refresh-secret',
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    guard = new JwtAuthGuard(jwtService, mockJwtConfig);
    jest.clearAllMocks();
  });

  const createMockContext = (authHeader?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: authHeader },
        }),
      }),
    }) as any;

  it('Выбрасывает UnauthorizedException если заголовок Authorization отсутствует.', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not found'),
    );
  });

  it('Выбрасывает UnauthorizedException если токен отсутствует после Bearer.', async () => {
    const context = createMockContext('Bearer');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token not found'),
    );
  });

  it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );

    const context = createMockContext('Bearer invalidToken');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });

  it('Успешно активирует guard при валидном токене.', async () => {
    const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);

    const request: any = {
      headers: { authorization: 'Bearer validToken' },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
      secret: mockJwtConfig.accessSecret,
    });
  });
});
