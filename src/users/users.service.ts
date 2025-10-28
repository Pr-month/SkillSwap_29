import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { IAppConfig } from 'src/config/types';
import { UsersQueryDto } from './dto/users-query.dto';
import { UUID } from 'crypto';
import { Skill } from 'src/entities/skill.entity';
import { SkillsService } from 'src/skills/skills.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appConfig: IAppConfig,
    @InjectRepository(Skill)
    private readonly skillsService: SkillsService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(id: UUID): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
  
  async getAllUsers(query: UsersQueryDto): Promise<{ data: User[]; count: number }> {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const options: FindManyOptions<User> = {
      take: limit,
      skip: offset,
    };

    const [data, count] = await this.userRepository.findAndCount(options);
    const numberPages = Math.ceil(count/limit);
    
    if (numberPages < page) {
      throw new NotFoundException('Запрашиваемая страница не существует');
    }
    
    return { data, count };
  }

  async updateUser(id: UUID, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...updateData,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async updatePassword(id: UUID, oldPassword: string, newPassword: string) {
    const user = await this.findOneById(id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (isMatch) {
      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        this.appConfig.bcryptSalt,
      );
      await this.userRepository.update(id, { password: hashedNewPassword });
      return { message: 'Пароль успешно обновлен' };
    } else {
      throw new BadRequestException('Старый пароль не совпадает');
    }
  }

  async getUsersBySkillCategory(skillId: string): Promise<User[]> {
    // Получаем навык по ID
    const skill = await this.skillsService.findById(skillId);

    if (!skill) {
      throw new Error('Навык не найден');
    }

    // Получаем категорию навыка
    const category = skill.category;

    if (!category) {
      throw new Error('Категория навыка не найдена');
    }

    // Ищем пользователей, у которых эта категория в wantToLearn
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.wantToLearn', 'wantToLearnSkill')
      .leftJoin('wantToLearnSkill.category', 'category')
      .where('category.id = :categoryId', { categoryId: category.id })
      .take(10)
      .getMany();
  }
}
