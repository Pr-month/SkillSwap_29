import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
  Patch,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { AuthRequest } from '@/auth/types';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordDto } from '@/auth/dto/password.dto';
import { UUID } from 'crypto';
import { UsersQueryDto } from './dto/users-query.dto';
import {
  ApiGetAllUsers,
  ApiGetMe,
  ApiGetUser,
  ApiGetUsersBySkill,
  ApiUpdateMe,
  ApiUpdatePassword,
} from './users.swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiGetAllUsers()
  async allUsers(@Query() query: UsersQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiGetMe()
  async getMe(@Req() req: AuthRequest): Promise<User> {
    return this.usersService.findOneById(req.user.sub);
  }

  @Get(':id')
  @ApiGetUser()
  async findOne(@Param('id', ParseUUIDPipe) id: UUID): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiUpdateMe()
  async updateMe(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(req.user.sub, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @ApiUpdatePassword()
  async updatePassword(
    @Req() req: AuthRequest,
    @Body() updatePasswordDto: PasswordDto,
  ) {
    return this.usersService.updatePassword(
      req.user.sub,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
  }

  @Get('by-skill/:id')
  @ApiGetUsersBySkill()
  async getUsersBySkillCategory(@Param('id') skillId: string): Promise<User[]> {
    return this.usersService.getUsersBySkillCategory(skillId);
  }
}
