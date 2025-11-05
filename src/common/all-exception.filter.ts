import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { MulterError } from 'multer';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

export interface PostgresError extends Error {
  code?: string;
  detail?: string;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp?: string;
}

// Типизированный Request от Nest/Express с возможным пользователем
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string | number;
  } | null;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly logger = new Logger(AllExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const sendErrorResponse = (
      status: HttpStatus,
      message: string,
      error: string,
      caught?: unknown,
    ) => {
      const safePath: string = String(httpAdapter.getRequestUrl(request));
      const responseBody: ErrorResponse = {
        statusCode: status,
        message,
        error,
        path: safePath,
        timestamp: new Date().toISOString(),
      };

      const isProd = process.env.NODE_ENV === 'production';
      const authReq = request as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const meta: Record<string, unknown> = {
        method: request.method,
        path: safePath,
        status,
        error,
        message,
        requestId: request.headers['x-request-id'],
        userId,
      };

      const logMessage = `${request.method} ${safePath} → ${status} ${error}`;

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          logMessage,
          !isProd && caught instanceof Error ? caught.stack : undefined,
          'AllExceptionFilter',
        );
      } else {
        this.logger.warn(logMessage, undefined, 'AllExceptionFilter');
      }

      if (!isProd) {
        this.logger.debug(
          JSON.stringify(meta),
          undefined,
          'AllExceptionFilter',
        );
      }

      httpAdapter.reply(ctx.getResponse(), responseBody, status);
    };

    if (exception instanceof EntityNotFoundError) {
      return sendErrorResponse(
        HttpStatus.NOT_FOUND,
        'Сущность не найдена',
        'Not Found',
        exception,
      );
    }

    if (
      exception instanceof QueryFailedError &&
      (exception as PostgresError).code === '23505'
    ) {
      return sendErrorResponse(
        HttpStatus.CONFLICT,
        'Запись с такими данными уже существует',
        'Conflict',
        exception,
      );
    }

    if (
      exception instanceof MulterError &&
      exception.code === 'LIMIT_FILE_SIZE'
    ) {
      return sendErrorResponse(
        HttpStatus.PAYLOAD_TOO_LARGE,
        'Превышен допустимый размер файла',
        'Payload Too Large',
        exception,
      );
    }
    //Ошибка типа файла из fileFilter
    if (
      exception instanceof Error &&
      exception.message.includes('Недопустимый тип файла')
    ) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Invalid File Type',
        timestamp: new Date().toISOString(),
      });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        return sendErrorResponse(
          status,
          errorResponse,
          exception.name,
          exception,
        );
      }

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const responseObject = errorResponse as Record<string, unknown>;
        // Обрабатываем ошибки валидации, где message может быть массивом
        const message = Array.isArray(responseObject.message)
          ? responseObject.message.join(', ')
          : (responseObject.message as string) || exception.message;

        const error = (responseObject.error as string) || exception.name;
        return sendErrorResponse(status, message, error, exception);
      }
    }

    return sendErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Внутренняя ошибка сервера',
      'Internal Server Error',
      exception,
    );
  }
}
