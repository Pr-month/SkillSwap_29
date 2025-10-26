import { NestFactory, Reflector } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/all-exception.filter';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { loggingConfig } from './logger';
import { Logger } from '@nestjs/common';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggingConfig),
  });
  const logger = new Logger('App');

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Запуск сервера
  const { port, host } = appConfig();
  await app.listen(port, host);
  logger.log(`Сервер запущен: http://${host}:${port}`);
}

void bootstrap();
