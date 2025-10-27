import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('APP_CONFIG', () => ({
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT) || 3000,
  bcryptSalt: Number(process.env.BCRYPT_SALT) || 10,
}));
