import * as winston from 'winston';
import 'winston-daily-rotate-file'; // Импортируем для регистрации транспорта
import { tskvFormat } from '../formats/tskv.format';

/**
 * Транспорт для записи логов в формате TSKV с ежедневной ротацией.
 */
export const fileTskvTransport = new winston.transports.DailyRotateFile({
  level: 'info',
  // %DATE% будет заменяться на дату в формате YYYY-MM-DD
  filename: 'logs/app-tskv-%DATE%.log',
  // Паттерн для даты в имени файла
  datePattern: 'YYYY-MM-DD',
  // Архивировать старые логи
  zippedArchive: true,
  // Максимальный размер файла (например, 20 мегабайт)
  maxSize: '20m',
  // Хранить логи за последние 14 дней
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    tskvFormat,
  ),
});
