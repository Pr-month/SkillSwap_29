import { Request } from 'express';
import { User } from 'src/entities/user.entity';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};

export type RefreshRequest = Request & {
  user: User;
  token: string;
};
