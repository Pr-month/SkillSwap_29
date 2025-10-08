import { registerAs } from '@nestjs/config'

export const config = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skillswap_29',
  },
  jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
}))