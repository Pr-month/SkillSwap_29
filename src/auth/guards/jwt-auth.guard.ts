import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtConfig } from 'src/config/types';
import { Request } from 'express';
import { UserPayload } from '@/auth/guards/roles.guard'; // Импортируем тип Request из express
import { jwtConfig as jwt } from '@/config/jwt.config';

export interface RequestWithUser extends Request {
  user?: UserPayload;
  token?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwt.KEY)
    private readonly jwtConfig: IJwtConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      request.user = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: this.jwtConfig.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
