import * as winston from 'winston';
import { consoleFormat } from '../formats/console.format';

/**
 * Транспорт для вывода логов в консоль в режиме разработки
 */
export const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: consoleFormat,
});
