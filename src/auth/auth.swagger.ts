import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordDto } from './dto/password.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';

export const ApiRegister = () =>
  applyDecorators(
    ApiOperation({ summary: 'Регистрация нового пользователя' }),
    ApiBody({
      description: 'Данные для регистрации нового пользователя',
      type: RegisterDto,
      required: true,
    }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно зарегистрирован',
      type: RegisterResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Валидационная ошибка',
    }),
    ApiResponse({
      status: 409,
      description: 'Пользователь с таким email уже существует',
    }),
  );

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Логин пользователя',
      description:
        'Аутентификация пользователя по email и паролю. Возвращает данные пользователя и токены доступа.',
    }),
    ApiBody({
      description: 'Учетные данные пользователя',
      type: LoginDto,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Успешная аутентификация',
      type: LoginResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации входных данных',
    }),
    ApiResponse({
      status: 401,
      description: 'Неверные учётные данные',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Выход из системы (инвалидация refresh токена)' }),
    ApiResponse({
      status: 200,
      description: 'Успешный выход',
    }),
    ApiResponse({
      status: 401,
      description: 'Неавторизован',
    }),
  );

export const ApiRefresh = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление пары токенов',
      description:
        'Обновление access и refresh токенов по валидному refresh токену',
    }),
    ApiBody({
      description: 'Refresh токен для обновления пары токенов',
      type: PasswordDto,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Токены успешно обновлены',
      type: RefreshResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Неавторизован или просрочен refresh токен',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );
