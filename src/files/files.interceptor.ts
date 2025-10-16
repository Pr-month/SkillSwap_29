// files.interceptor.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class FilesInterceptor implements NestInterceptor {
  private multerInterceptor: NestInterceptor;

  constructor(private readonly configService: ConfigService) {
    const maxSize =
      this.configService.get<number>('FILE_CONFIG.fileSize') || 2 * 1024 * 1024;
    const allowedTypes = this.configService.get<string[]>(
      'FILE_CONFIG.allowedMimeTypes',
    ) || ['image/jpeg', 'image/png'];

    // FileInterceptor возвращает класс (Type<NestInterceptor>)
    const MixinInterceptorClass = FileInterceptor('file', {
      storage: diskStorage({
        destination: './public',
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname);
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: { fileSize: maxSize },
      fileFilter: (_req, file, callback) => {
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new HttpException(
              `Недопустимый тип файла. Разрешено: ${allowedTypes.join(', ')}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }) as unknown as new (...args: any[]) => NestInterceptor;

    // создаём экземпляр класса — ТУТ главное отличие
    this.multerInterceptor = new MixinInterceptorClass();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    // делегируем вызов multer-интерсептору
    return this.multerInterceptor.intercept(context, next);
  }
}
