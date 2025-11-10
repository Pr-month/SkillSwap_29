import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthRequest, RefreshRequest } from './types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Валидационная ошибка',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Логин пользователя',
    description:
      'Аутентификация пользователя по email и паролю. Возвращает данные пользователя и токены доступа.',
  })
  @ApiBody({
    description: 'Учетные данные пользователя',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации входных данных',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учётные данные',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Выход из системы (инвалидация refresh токена)' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async logout(@Req() req: AuthRequest) {
    await this.authService.logout(req.user.sub);
    return { message: 'Successfully logged out' };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({
    summary: 'Обновление пары токенов',
    description:
      'Обновление access и refresh токенов по валидному refresh токену',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизован или просрочен refresh токен',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  async refresh(@Req() req: RefreshRequest) {
    return this.authService.refreshTokens(req.user.id, req.token);
  }
}
