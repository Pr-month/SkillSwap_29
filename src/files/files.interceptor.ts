import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigType } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { fileConfig } from '@/config/file.config';

@Injectable()
export class FilesInterceptor implements NestInterceptor {
  private multerInterceptor: NestInterceptor;

  constructor(
    @Inject(fileConfig.KEY)
    private readonly config: ConfigType<typeof fileConfig>,
  ) {
    const maxSize = config.fileSize;
    const allowedTypes = config.allowedMimeTypes;

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
          return callback(null, false);
        }
        callback(null, true);
      },
    }) as unknown as new (...args: any[]) => NestInterceptor;

    // создаём экземпляр класса
    this.multerInterceptor = new MixinInterceptorClass();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    // делегируем вызов multer-интерсептору
    return this.multerInterceptor.intercept(context, next);
  }
}
