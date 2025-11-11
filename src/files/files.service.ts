import {
  Injectable,
  Inject,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { fileConfig } from '@/config/file.config';

@Injectable()
export class FilesService {
  private readonly maxSizeMB: number;

  constructor(
    @Inject(fileConfig.KEY)
    private readonly config: ConfigType<typeof fileConfig>,
  ) {
    this.maxSizeMB = Math.round(this.config.fileSize / (1024 * 1024));
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Неподдерживаемый тип файла. Разрешены: ${this.config.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.config.fileSize) {
      throw new PayloadTooLargeException(
        `Превышен максимальный размер файла (${this.maxSizeMB}MB)`,
      );
    }
  }

  getPublicFileUrl(filename: string): string {
    return `${this.config.imageCDN}${filename}`;
  }
}
