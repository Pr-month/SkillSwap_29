import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileUploadResponseDto } from './dto/upload-file.dto';

export const ApiUploadFile = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Загрузка файла',
      description:
        'Загружает файл на сервер и возвращает url загруженного файла на сервере',
    }),
    ApiResponse({
      status: 201,
      description: 'Файл успешно загружен',
      type: FileUploadResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректный запрос',
    }),
    ApiResponse({
      status: 413,
      description: 'Превышен максимальный размер файла',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
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
    }),
  );
