import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as findConfig from 'find-config';
import { DataSource } from 'typeorm';

// Загружаем переменные из нужного .env файла в зависимости от NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'test' ? '.env.test' : '.env';
const envPath: string =
  findConfig(envFile) || path.join(process.cwd(), envFile);

dotenv.config({ path: envPath, override: true });

// Основная конфигурация PostgreSQL
export const dbConfig = registerAs(
  'DB',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
    dropSchema: false,
  }),
);

// Создаем и экспортируем источник данных
export const AppDataSource = new DataSource(dbConfig());
