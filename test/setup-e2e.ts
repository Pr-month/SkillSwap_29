import { Logger } from '@nestjs/common';

// Глобально выключаем логгер NestJS в e2e-тестах,
// чтобы не печатались ERROR [ExceptionsHandler] и прочие сообщения
Logger.overrideLogger(false);

import * as dotenv from 'dotenv';

// Ensure test env
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Load .env.test if present
dotenv.config({ path: '.env.test' });

// Фильтруем шум от ExceptionsHandler в e2e: оставляем прочие ошибки нетронутыми
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);
const shouldSkip = (args: any[]): boolean => {
  try {
    return args.some(
      (a) => typeof a === 'string' && a.includes('[ExceptionsHandler]'),
    );
  } catch {
    return false;
  }
};

console.error = (...args: any[]) => {
  if (shouldSkip(args)) return;
  originalError(...args);
};

console.warn = (...args: any[]) => {
  if (shouldSkip(args)) return;
  originalWarn(...args);
};

// Подавляем прямые записи с пометкой ExceptionsHandler
process.stderr.write = ((chunk: any, encoding?: any, cb?: any) => {
  try {
    const text = Buffer.isBuffer(chunk)
      ? chunk.toString('utf8')
      : String(chunk);
    if (text.includes('[ExceptionsHandler]')) return true;
  } catch {}
  return originalStderrWrite(chunk, encoding, cb);
}) as any;

process.stdout.write = ((chunk: any, encoding?: any, cb?: any) => {
  try {
    const text = Buffer.isBuffer(chunk)
      ? chunk.toString('utf8')
      : String(chunk);
    if (text.includes('[ExceptionsHandler]')) return true;
  } catch {}
  return originalStdoutWrite(chunk, encoding, cb);
}) as any;
