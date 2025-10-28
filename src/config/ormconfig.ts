import 'dotenv/config';
import { dbConfig } from './db.config';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

// Получаем базовую конфигурацию
const baseConfig: PostgresConnectionOptions = dbConfig();

// Добавляем специфичные настройки для разных окружений
const envConfig: Partial<PostgresConnectionOptions> = {
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production' ? 'all' : false,
  // Важно: не дропаем схему автоматически при инициализации, т.к. это ломает последовательные сиды
  // Управляем сбросом схемы явными командами npm: `db:drop:test` / `db:reset:test`
  dropSchema: false,
};

// Объединяем базовую конфигурацию с настройками окружения
const config: PostgresConnectionOptions = {
  ...baseConfig,
  ...envConfig,
};

// Создаем и экспортируем источник данных
export const AppDataSource = new DataSource(config);
