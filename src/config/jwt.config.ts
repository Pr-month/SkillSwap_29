import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_default',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_default',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
