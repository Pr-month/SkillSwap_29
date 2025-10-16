import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesInterceptor } from './files.interceptor';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Файл не указан', HttpStatus.BAD_REQUEST);
    }

    const publicUrl = this.filesService.getPublicFileUrl(file.filename);
    //Здесь можно добавить сохранение ссылки в БД
    return { url: publicUrl };
  }
}
