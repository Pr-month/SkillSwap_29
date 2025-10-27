import * as winston from 'winston';

/**
 * Транспорт для записи логов в формате JSON
 */
export const fileJsonTransport = new winston.transports.File({
  level: 'info',
  filename: 'logs/app-json.log',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});
