import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return this.userService.findOneById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: User): Promise<User> {
        return this.userService.findOneById(req.id);
    }
}
