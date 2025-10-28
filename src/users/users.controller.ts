import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { AuthRequest } from '@/auth/types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordDto } from '@/auth/dto/password.dto';
import { UUID } from 'crypto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей получен' })
  async allUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль пользователя', type: User })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async getMe(@Req() req: AuthRequest): Promise<User> {
    return this.userService.findOneById(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь', type: User })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<User> {
    return this.userService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Обновлённый пользователь',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Валидационная ошибка' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async updateMe(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(req.user.sub, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me/password')
  @ApiOperation({ summary: 'Обновить пароль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Пароль обновлён' })
  @ApiResponse({ status: 400, description: 'Валидационная ошибка' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async updatePassword(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: PasswordDto,
  ) {
    return this.userService.updatePassword(
      req.user.sub,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
  }
}
