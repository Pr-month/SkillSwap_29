import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
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
      (exception as any).code === '23505'
    ) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Запись с такими данными уже существует',
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      });
    }

    if (
      exception.name === 'PayloadTooLargeException' ||
      exception.status === HttpStatus.PAYLOAD_TOO_LARGE
    ) {
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'Превышен допустимый размер файла',
        error: 'PayLoad Too Large',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
