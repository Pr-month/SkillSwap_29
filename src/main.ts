import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { WsAdapter } from '@nestjs/platform-ws';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from '@/common/all-exception.filter';
import { loggingConfig } from '@/logger';
import { appConfig } from '@/config/app.config';
import { AppModule } from './app.module';
import { configureSwagger } from '@/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggingConfig),
  });
  const logger = new Logger('App');

  // Middleware для парсинга JSON
  app.use(express.json());

  // Подключаем WebSocket адаптер
  app.useWebSocketAdapter(new WsAdapter(app));

  // Глобальные фильтры и интерцепторы
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = appConfig();

  // CORS
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
  });

  // Swagger
  configureSwagger(app);

  // Запуск сервера
  const { port, host } = config;
  await app.listen(port, host);
  logger.log(`Сервер запущен: http://${host}:${port}`);
}

void bootstrap();
