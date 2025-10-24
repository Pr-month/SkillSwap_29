import * as winston from 'winston';

// Кастомный формат для TSKV
export const tskvFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    // Базовые поля
    let log = `timestamp=${timestamp}\tlevel=${level}\tmessage=${message}`;

    // Добавляем метаданные
    for (const key in meta) {
      if (Object.prototype.hasOwnProperty.call(meta, key)) {
        const value =
          typeof meta[key] === 'object' ? JSON.stringify(meta[key]) : meta[key];
        log += `\t${key}=${value}`;
      }
    }
    return log;
  },
);
