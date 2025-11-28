import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '@/enums/request-status.enum';

export const ApiCreateRequest = () =>
  applyDecorators(
    ApiOperation({ summary: 'Создать заявку на обмен навыками' }),
    ApiBody({
      type: CreateRequestDto,
      description:
        'Только UUID навыков. Владелец offeredSkillId — отправитель, владелец requestedSkillId — получатель',
      examples: {
        sample: {
          summary: 'Пример',
          value: {
            offeredSkillId: '11111111-1111-1111-1111-111111111111',
            requestedSkillId: '22222222-2222-2222-2222-222222222222',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'Заявка создана' }),
    ApiResponse({
      status: 400,
      description: 'Некорректные данные',
    }),
    ApiResponse({
      status: 404,
      description: 'Навык или пользователь не найден',
    }),
  );

export const ApiFindIncomingRequests = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить входящие заявки',
      description:
        'Возвращает список заявок, где текущий пользователь является получателем',
    }),
    ApiResponse({
      status: 200,
      description: 'Список входящих заявок успешно получен',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiFindOutgoingRequests = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить исходящие заявки',
      description:
        'Возвращает список заявок, где текущий пользователь является отправителем',
    }),
    ApiResponse({
      status: 200,
      description: 'Список исходящих заявок успешно получен',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
  );

export const ApiMarkRequestAsRead = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Пометить заявку как прочитанную',
      description: 'Помечает заявку как прочитанную текущим пользователем',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '11111111-1111-1111-1111-111111111111',
    }),
    ApiResponse({
      status: 200,
      description: 'Заявка успешно помечена как прочитанная',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
    ApiResponse({
      status: 403,
      description: 'Нет прав для выполнения операции',
    }),
    ApiResponse({
      status: 404,
      description: 'Заявка не найдена',
    }),
  );

const createUpdateStatusDecorator = (status: RequestStatus, summary: string) =>
  applyDecorators(
    ApiOperation({
      summary,
      description: `Обновляет статус заявки на ${status.toLowerCase()}`,
    }),
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '11111111-1111-1111-1111-111111111111',
    }),
    ApiResponse({
      status: 200,
      description: `Статус заявки успешно обновлен на ${status.toLowerCase()}`,
    }),
    ApiResponse({
      status: 400,
      description: 'Некорректный статус для обновления',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
    ApiResponse({
      status: 403,
      description: 'Нет прав для выполнения операции',
    }),
    ApiResponse({
      status: 404,
      description: 'Заявка не найдена',
    }),
  );

export const ApiAcceptRequest = () =>
  createUpdateStatusDecorator(RequestStatus.ACCEPTED, 'Принять заявку');

export const ApiRejectRequest = () =>
  createUpdateStatusDecorator(RequestStatus.REJECTED, 'Отклонить заявку');

export const ApiDeleteRequest = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Удалить заявку',
      description:
        'Удаляет заявку. Доступно только отправителю или администратору',
    }),
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '11111111-1111-1111-1111-111111111111',
    }),
    ApiResponse({
      status: 200,
      description: 'Заявка успешно удалена',
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
    }),
    ApiResponse({
      status: 403,
      description: 'Нет прав для удаления заявки',
    }),
    ApiResponse({
      status: 404,
      description: 'Заявка не найдена',
    }),
  );
