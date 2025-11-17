import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FilesInterceptor } from './files.interceptor';
import { ApiUploadFile } from './files.swagger';

@ApiTags('Файлы')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor)
  @ApiUploadFile()
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    this.filesService.validateFile(file);
    const publicUrl = this.filesService.getPublicFileUrl(file.filename);

    return { url: publicUrl };
  }
}
