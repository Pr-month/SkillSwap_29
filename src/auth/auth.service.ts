import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types';
import { jwtConfig } from '@/config/jwt.config';
import { IAppConfig, IJwtConfig } from '@/config/types';
import { appConfig } from '@/config/app.config';
import { UserRole } from '@/enums/roles.enum';
import { Gender } from '@/enums/gender.enum';
import { UUID } from 'crypto';
import { Skill } from '@/entities/skill.entity';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.appConfig.bcryptSalt,
    );

    const skillToLearn = await this.userRepository.manager.findOne(Skill, {
      where: { id: dto.wantToLearn },
    });

    if (!skillToLearn) {
      throw new BadRequestException('Категория для изучения не найдена');
    }

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || UserRole.USER,
      gender: dto.gender || Gender.UNKNOWN,
      wantToLearn: [skillToLearn],
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      // Обрабатываем ошибку дубликата email
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code === '23505'
      ) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error; // Пробрасываем другие ошибки
    }

    this.logger.log(
      `Пользователь успешно зарегистрирован. ID: ${user.id}, Email: ${user.email}`,
    );

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Неверные учетные данные');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Неверные учетные данные');

    this.logger.log(
      `Пользователь успешно вошел в систему. ID: ${user.id}, Email: ${user.email}`,
    );

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return user;
  }

  async logout(userId: UUID) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Пользователь не найден');

    user.refreshToken = '';
    await this.userRepository.save(user);

    this.logger.log(`Пользователь успешно вышел из системы. ID: ${user.id}`);
  }

  async refreshTokens(userId: UUID, refreshToken: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Пользователь не найден');

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid)
        throw new UnauthorizedException('Неверный токен обновления');

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Неверный или истекший токен обновления');
    }
  }

  async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.accessSecret,
      privateKey: this.jwtConfig.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refreshSecret,
      privateKey: this.jwtConfig.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: UUID, token: string) {
    const hashed = await bcrypt.hash(token, this.appConfig.bcryptSalt);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }
}
