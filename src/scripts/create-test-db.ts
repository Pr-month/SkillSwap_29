import { Client } from 'pg';
import * as dotenv from 'dotenv';

async function createDatabase() {
  try {
    console.log('🚀 Начинаем процесс создания базы данных...');

    dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

    // Извлекаем параметры подключения
    const dbConfig = {
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME!,
      logging: false,
    };

    // Проверяем наличие необходимых параметров
    if (!dbConfig.database) {
      console.log('❌ Имя базы данных не указано в .env.test');
      process.exit(1);
    }

    // Создаем клиент для подключения к postgres
    console.log('🔌 Подключаемся к системной базе данных PostgreSQL...');
    const client = new Client({
      ...dbConfig,
      database: 'postgres', // Подключаемся к системной БД для создания новой
    });

    await client.connect();
    console.log('✅ Подключение к PostgreSQL успешно установлено');

    // Проверяем существование базы данных
    console.log(
      `🔍 Проверяем существование базы данных "${dbConfig.database}"...`,
    );
    const checkDbQuery = `
      SELECT 1 FROM pg_database
      WHERE datname = $1
    `;

    const dbExists = await client.query(checkDbQuery, [dbConfig.database]);

    if (dbExists.rows.length === 0) {
      console.log(
        `📦 База данных "${dbConfig.database}" не существует. Создаём...`,
      );
      // Создаем базу данных если она не существует
      const createDbQuery = `CREATE DATABASE ${dbConfig.database}`;
      await client.query(createDbQuery);
      console.log(`✅ База данных "${dbConfig.database}" успешно создана`);
    } else {
      console.log(`ℹ️ База данных "${dbConfig.database}" уже существует`);
    }
    await client.end();
  } catch (error) {
    console.error('❌ Ошибка при создании базы данных:', error);
    process.exit(1);
  }
}

// Запускаем функцию создания базы данных
console.log('🎬 Запуск скрипта создания тестовой базы данных...');
void createDatabase();
