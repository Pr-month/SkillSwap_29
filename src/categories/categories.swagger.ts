import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@/entities/category.entity';

export const ApiGetAllCategories = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить все категории',
      description: 'Позволяет получить список всех категорий',
    }),
    ApiResponse({
      status: 200,
      description: 'Список категорий успешно получен',
      type: [Category],
    }),
  );

export const ApiCreateCategory = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать новую категорию',
      description: 'Доступно только для администраторов',
    }),
    ApiResponse({
      status: 201,
      description: 'Категория успешно создана',
      type: Category,
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для создания категории',
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({
      status: 409,
      description:
        'Категория с таким названием уже существует на данном уровне',
    }),
    ApiBody({
      type: CreateCategoryDto,
      examples: {
        'Создание категории': {
          summary: 'Пример создания категории',
          description: 'В этом примере создается категория "Программирование".',
          value: { name: 'Программирование' },
        },
        'Создание подкатегории': {
          summary: 'Пример создания подкатегории',
          description:
            'В этом примере создается подкатегория "Веб-разработка" внутри существующей категории.',
          value: {
            name: 'Веб-разработка',
            parentId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
          },
        },
      },
    }),
  );

export const ApiUpdateCategory = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить категорию',
      description: 'Доступно только для администраторов',
    }),
    ApiResponse({
      status: 200,
      description: 'Категория успешно обновлена',
      type: Category,
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для обновления категории',
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
    ApiParam({
      name: 'id',
      description: 'ID категории для обновления',
      example: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118',
    }),
    ApiBody({
      type: UpdateCategoryDto,
      examples: {
        'Изменение названия': {
          summary: 'Изменить название категории',
          value: { name: 'Новое название' },
        },
        'Перемещение категории': {
          summary: 'Переместить категорию в другую родительскую',
          value: { parentId: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118' },
        },
      },
    }),
  );

export const ApiDeleteCategory = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить категорию',
      description: 'Доступно только для администраторов',
    }),
    ApiResponse({ status: 204, description: 'Категория успешно удалена' }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 403, description: 'Нет прав доступа' }),
    ApiResponse({ status: 404, description: 'Категория не найдена' }),
    ApiParam({
      name: 'id',
      description: 'ID категории для удаления',
      example: 'cfd8ef51-a19e-40f5-9fdb-518a0696c118',
    }),
  );
