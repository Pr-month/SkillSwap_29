import { registerAs } from '@nestjs/config';

export const wsConfig = registerAs('WS_CONFIG', () => ({
  notifications: {
    host: String(process.env.NOTIFICATIONS_WS_HOST) || 'localhost',
    port:
      process.env.NODE_ENV === 'test'
        ? 0
        : Number(process.env.NOTIFICATIONS_WS_PORT) || 3001,
    path: '/',
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? [/production-domain\.ru$/]
          : ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  },
}));

export type WsConfig = ReturnType<typeof wsConfig>;
