import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { jwtConfig } from 'src/config/jwt.config';
import { IJwtConfig } from 'src/config/types';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) 
    private readonly userRepository: Repository<User>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: IJwtConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Authorization header missing');

    const [, refreshToken] = authHeader.split(' ');
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.jwtConfig.refreshSecret,
    });

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    request.user = user;
    request.token = refreshToken;

    return true;
  }
}
