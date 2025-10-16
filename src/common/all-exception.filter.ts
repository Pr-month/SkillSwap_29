import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export interface PostgresError extends Error {
  code?: string;
  detail?: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.error('Exception caught in filter:', exception);

    if (exception instanceof EntityNotFoundError) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Сущность не найдена',
        error: 'Not Found',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      exception instanceof QueryFailedError &&
      (exception as PostgresError).code === '23505'
    ) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Запись с такими данными уже существует',
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      exception instanceof MulterError &&
      exception.code === 'LIMIT_FILE_SIZE'
    ) {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'Превышен допустимый размер файла',
        error: 'PayLoad Too Large',
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}
