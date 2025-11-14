import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT) || 3000,
  bcryptSalt: Number(process.env.BCRYPT_SALT) || 10,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3080',
}));
