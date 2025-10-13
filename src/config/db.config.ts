import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs(
  'DB',
  (): DataSourceOptions => ({
    type: 'postgres',
    applicationName: 'skillswap',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skillswap',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: ['dist/migration/**/*{.js,.ts}'],
    synchronize: process.env.NODE_ENV !== 'production',
  }),
);
