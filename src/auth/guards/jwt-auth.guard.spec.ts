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
    jwtService = { verify: jest.fn() } as any;
    guard = new JwtAuthGuard(jwtService, mockJwtConfig);
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

  it('Выбрасывает UnauthorizedException если заголовок Authorization отсутствует.', () => {
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException если токен отсутствует после Bearer.', () => {
    const context = createMockContext('Bearer');
    expect(() => guard.canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });

  it('Выбрасывает UnauthorizedException при неверном токене.', () => {
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const context = createMockContext('Bearer invalidToken');
    expect(() => guard.canActivate(context)).toThrow(
      UnauthorizedException,
    );
  });

  it('Успешно активирует guard при валидном токене.', () => {
    const payload = { sub: 'user-id', email: 'test@example.com', role: 'USER' };
    (jwtService.verify as jest.Mock).mockReturnValue(payload);

    const request: any = {
      headers: {
        authorization: 'Bearer validToken',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(request.user).toEqual(payload);
    expect(jwtService.verify).toHaveBeenCalledWith('validToken', {
      secret: mockJwtConfig.accessSecret,
    });
  });
});