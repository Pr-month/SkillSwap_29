import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { User } from '@/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordDto } from '@/auth/dto/password.dto';

export const ApiGetAllUsers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить список пользователей с пагинацией',
      description: 'Возвращает список пользователей с поддержкой пагинации',
    }),
    ApiResponse({
      status: 200,
      description: 'Список пользователей с пагинацией',
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 20 },
              total: { type: 'number', example: 100 },
              totalPages: { type: 'number', example: 5 },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректные параметры запроса',
    }),
  );

export const ApiGetMe = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Получить профиль текущего пользователя',
      description: 'Возвращает профиль аутентифицированного пользователя',
    }),
    ApiResponse({
      status: 200,
      description: 'Профиль пользователя',
      type: User,
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiGetUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить пользователя по ID',
      description: 'Возвращает информацию о пользователе по его идентификатору',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID пользователя',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Информация о пользователе',
      type: User,
    }),
    ApiResponse({
      status: 404,
      description: 'Пользователь не найден',
    }),
  );

export const ApiUpdateMe = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить профиль текущего пользователя',
      description:
        'Позволяет обновить информацию профиля аутентифицированного пользователя',
    }),
    ApiBody({
      type: UpdateUserDto,
      description: 'Данные для обновления профиля пользователя',
    }),
    ApiResponse({
      status: 200,
      description: 'Обновленный профиль пользователя',
      type: User,
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректные данные для обновления',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiUpdatePassword = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить пароль текущего пользователя',
      description:
        'Позволяет изменить пароль аутентифицированного пользователя',
    }),
    ApiBody({
      type: PasswordDto,
      description: 'Текущий и новый пароли пользователя',
    }),
    ApiResponse({
      status: 200,
      description: 'Пароль успешно обновлен',
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректные данные для обновления пароля',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiGetUsersBySkill = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить пользователей по категории навыка',
      description:
        'Возвращает список пользователей, владеющих навыком из указанной категории',
    }),
    ApiParam({
      name: 'id',
      description: 'ID категории навыка',
      example: '1',
    }),
    ApiResponse({
      status: 200,
      description:
        'Список пользователей, владеющих навыком из указанной категории',
      type: [User],
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректный ID категории',
    }),
    ApiResponse({
      status: 404,
      description: 'Категория не найдена',
    }),
  );
