import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export const authConfig = registerAs('AUTH', () => ({
  bcryptSalt: Number(process.env.BCRYPT_SALT) || 10,
  accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_default',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_default',
  accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as StringValue,
  refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,
  yandexID: process.env.YANDEX_CLIENT_ID || '',
  yandexSecret: process.env.YANDEX_CLIENT_SECRET || '',
  googleID: process.env.GOOGLE_CLIENT_ID || '',
  googleSecret: process.env.GOOGLE_CLIENT_SECRET || '',
}));

export type AuthConfig = ReturnType<typeof authConfig>;
