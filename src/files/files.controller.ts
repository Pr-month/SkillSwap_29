import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { FilesInterceptor } from './files.interceptor';
import { FileUploadResponseDto } from './dto/upload-file.dto';

@ApiTags('Файлы')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor)
  @ApiOperation({
    summary: 'Загрузка файла',
    description:
      'Загружает файл на сервер и возвращает url загруженного файла на сервере',
  })
  @ApiResponse({
    status: 201,
    description: 'Файл успешно загружен',
    type: FileUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректный запрос',
  })
  @ApiResponse({
    status: 413,
    description: 'Превышен максимальный размер файла',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл для загрузки',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл для загрузки',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    this.filesService.validateFile(file);
    const publicUrl = this.filesService.getPublicFileUrl(file.filename);

    return { url: publicUrl };
  }
}
