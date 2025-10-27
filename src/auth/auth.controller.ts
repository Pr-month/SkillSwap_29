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
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthRequest, RefreshRequest } from './types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Валидационная ошибка' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Логин пользователя' })
  @ApiResponse({ status: 200, description: 'Успешная аутентификация' })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
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
  @ApiOperation({ summary: 'Обновление пары токенов по refresh токену' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({
    status: 401,
    description: 'Неавторизован или просрочен refresh токен',
  })
  async refresh(@Req() req: RefreshRequest) {
    return this.authService.refreshTokens(req.user.id, req.token);
  }
}
