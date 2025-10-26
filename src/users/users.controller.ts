import { Controller, Get, Patch, Param, ParseUUIDPipe, Req, UseGuards, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PasswordDto } from 'src/auth/dto/password.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Get()
    async allUsers(@Query() query: UsersQueryDto) {
        return this.userService.getAllUsers(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return this.userService.findOneById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: AuthRequest): Promise<User> {
        return this.userService.findOneById(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/password')
    async updatePassword(@Req() req: AuthRequest, @Body() updatePasswordDto: PasswordDto) {
        return this.userService.updatePassword(req.user.sub, updatePasswordDto.currentPassword, updatePasswordDto.newPassword);
    }
}
