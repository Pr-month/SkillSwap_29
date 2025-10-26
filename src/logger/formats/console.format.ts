import * as winston from 'winston';

/**
 * Формат для вывода логов в консоль в режиме разработки
 */
export const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.ms(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, context, ms } = info;

    const symbols: Record<string, string> = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '🔴',
      debug: '⚙️',
    };

    const rawLevel = info[Symbol.for('level')] as string;
    const symbol = symbols[rawLevel] || ' ';
    const colorizedSymbol = level.replace(rawLevel, symbol);

    // ANSI-коды для цветов
    const grey = '\u001b[90m';
    const magenta = '\u001b[35m';
    const reset = '\u001b[0m';

    const contextMessage = context ? `${magenta}[${context}]${reset}` : '';
    const msMessage = `${grey}${ms}${reset}`;

    return `${timestamp} ${colorizedSymbol} ${contextMessage} ${message} ${msMessage}`;
  }),
);
