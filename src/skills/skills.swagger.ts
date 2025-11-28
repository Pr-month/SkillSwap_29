import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Skill } from '@/entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

export const ApiGetAllSkills = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить список навыков',
      description: 'Возвращает отфильтрованный список навыков',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Номер страницы',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Количество элементов на странице',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Поиск по названию навыка',
    }),
    ApiResponse({
      status: 200,
      description: 'Список навыков успешно получен',
      type: [Skill],
    }),
  );

export const ApiGetSkill = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить навык по ID',
      description: 'Возвращает информацию о навыке по его идентификатору',
    }),
    ApiParam({ name: 'id', description: 'UUID навыка' }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно найден',
      type: Skill,
    }),
    ApiResponse({
      status: 404,
      description: 'Навык не найден',
    }),
  );

export const ApiCreateSkill = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать новый навык',
      description: 'Доступно только для авторизованных пользователей',
    }),
    ApiBody({ type: CreateSkillDto }),
    ApiResponse({
      status: 201,
      description: 'Навык успешно создан',
      type: Skill,
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для создания навыка',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiUpdateSkill = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить навык',
      description: 'Обновляет информацию о навыке',
    }),
    ApiParam({ name: 'id', description: 'UUID навыка для обновления' }),
    ApiBody({ type: UpdateSkillDto }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно обновлен',
      type: Skill,
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для обновления навыка',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
    ApiResponse({
      status: 403,
      description: 'Нет прав доступа',
    }),
    ApiResponse({
      status: 404,
      description: 'Навык не найден',
    }),
  );

export const ApiDeleteSkill = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить навык',
      description: 'Удаляет навык по его идентификатору',
    }),
    ApiParam({ name: 'id', description: 'UUID навыка для удаления' }),
    ApiResponse({
      status: 204,
      description: 'Навык успешно удален',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
    ApiResponse({
      status: 403,
      description: 'Нет прав доступа',
    }),
    ApiResponse({
      status: 404,
      description: 'Навык не найден',
    }),
  );

export const ApiAddSkillToUser = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Добавить навык пользователю',
      description: 'Добавляет навык текущему пользователю',
    }),
    ApiParam({ name: 'id', description: 'UUID навыка для добавления' }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно добавлен пользователю',
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для добавления навыка',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiRemoveSkillFromUser = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить навык у пользователя',
      description: 'Удаляет навык у текущего пользователя',
    }),
    ApiParam({ name: 'id', description: 'UUID навыка для удаления' }),
    ApiResponse({
      status: 200,
      description: 'Навык успешно удален у пользователя',
    }),
    ApiResponse({
      status: 400,
      description: 'Неверные данные для удаления навыка',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );
