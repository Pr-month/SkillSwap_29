import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT', () => ({
  secret: process.env.JWT_SECRET || 'defaultsecret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}));
