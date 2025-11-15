import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AuthRequest, RefreshRequest } from './types';
import { ApiLogin, ApiLogout, ApiRefresh, ApiRegister } from './auth.swagger';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegister()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiLogin()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiLogout()
  async logout(@Req() req: AuthRequest) {
    await this.authService.logout(req.user.sub);
    return { message: 'Successfully logged out' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiRefresh()
  async refresh(@Req() req: RefreshRequest) {
    return this.authService.refreshTokens(req.user.id, req.token);
  }
}
