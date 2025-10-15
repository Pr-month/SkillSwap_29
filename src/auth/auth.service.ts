import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto'; 
import { JwtPayload } from './types';
import { jwtConfig } from 'src/config/jwt.config';
import { IAppConfig, IJwtConfig } from 'src/config/types';
import { appConfig } from 'src/config/app.config';

@Injectable()
export class AuthService {
  // private readonly salt = Number(process.env.BCRYPT_SALT) || 10; добавить в app.config
  // перенести гарды в auth DONE
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: IJwtConfig,
    @Inject(appConfig.KEY)
    private readonly appConfig: IAppConfig,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, this.appConfig.bcryptSalt);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userSafe } = user;
    return { user: userSafe, ...tokens };
  }

  async login(dto: LoginDto) { // возвращает 201, а не 200 DONE
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...userSafe } = user;
    return { user: userSafe, ...tokens };
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    user.refreshToken = '';
    await this.userRepository.save(user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn: this.jwtConfig.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, this.appConfig.bcryptSalt);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }
}
