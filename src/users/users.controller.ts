import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards,Patch , Body} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Get()
    async allUsers() {
        return this.userService.getAllUsers();
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
    @Patch('me')
    async updateMe(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
    return this.userService.updateUser(req.user.sub, updateUserDto);

}
