import { UUID } from 'crypto';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/enums/roles.enum';

export type JwtPayload = {
  sub: UUID;
  email: string;
  role: UserRole;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};

export type RefreshRequest = Request & {
  user: User;
  token: string;
};
