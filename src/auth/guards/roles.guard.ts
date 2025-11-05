import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/enums/roles.enum';
import { RequestWithUser } from '@/auth/guards/jwt-auth.guard';

export interface UserPayload {
  role: UserRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: UserPayload | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasRole = () => requiredRoles.includes(user.role);

    if (!hasRole()) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
