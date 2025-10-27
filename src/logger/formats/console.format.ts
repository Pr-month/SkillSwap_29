import { format, Logform } from 'winston';
import { inspect } from 'util';

/**
 * Формат для вывода логов в консоль в режиме разработки
 */
export const consoleFormat = format.combine(
  format.timestamp({ format: 'HH:mm:ss' }),
  format.ms(),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize(),
  format.printf((info: Logform.TransformableInfo) => {
    // Явно приводим свойства info к более конкретным типам для удовлетворения линтера
    const { timestamp, level, message, context, ms, stack } = info as {
      timestamp: string;
      level: string;
      message: string | object;
      context?: string | object;
      ms?: number;
      stack?: string;
    };

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

    // Явное и безопасное преобразование всех частей в строку
    const timestampStr = String(timestamp);
    const levelStr = String(colorizedSymbol);
    const messageStr =
      typeof message === 'string'
        ? message
        : inspect(message, { colors: true, depth: null });
    const contextStr = context
      ? ` ${magenta}[${inspect(context, { colors: true, depth: null })}]${reset}`
      : '';
    const msStr = ms ? ` ${grey}${String(ms)}${reset}` : '';
    const stackStr = stack
      ? `\n${grey}${inspect(stack, { colors: true, depth: null })}${reset}`
      : '';

    return `${timestampStr} ${levelStr}${contextStr} ${messageStr}${msStr}${stackStr}`;
  }),
);
