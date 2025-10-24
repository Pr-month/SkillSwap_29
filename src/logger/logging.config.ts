import * as winston from 'winston';
import {
  consoleTransport,
  fileJsonTransport,
  fileTskvTransport,
} from './transports';

export const loggingConfig: winston.LoggerOptions = {
  levels: winston.config.npm.levels,
  transports: [
    consoleTransport, // 1. Транспорт для консоли
    fileJsonTransport, // 2. Транспорт для JSON-файла
  ],
};
