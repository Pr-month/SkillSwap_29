import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { IJwtConfig } from 'src/config/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: IJwtConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Authorization header missing');

    const [, token] = authHeader.split(' ');
    if (!token) throw new UnauthorizedException('Token missing');

    try {
      request.user = this.jwtService.verify(token, { secret: this.jwtConfig.accessSecret });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
