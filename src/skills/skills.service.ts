import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  Like,
  FindOptionsWhere,
  Equal,
} from 'typeorm';
import { Skill } from './entities/skill.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { Category } from '../entities/category.entity';
import { UUID } from 'crypto';
import { User } from '../entities/user.entity';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    query: FindSkillsQueryDto,
  ): Promise<{ data: Skill[]; count: number }> {
    const { page, limit, category, search } = query;
    const offset = (page - 1) * limit;

    const where: FindOptionsWhere<Skill> = {};

    if (category) {
      where.category = Equal(category);
    }

    if (search) {
      where.title = Like(`%${search.trim()}%`);
    }

    const options: FindManyOptions<Skill> = {
      where,
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    };

    const [data, count] = await this.skillsRepository.findAndCount(options);
    return { data, count };
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!skill) {
      throw new NotFoundException(`Навык с ID ${id} не найден`);
    }
    return skill;
  }

  async create(createSkillDto: CreateSkillDto, userId: UUID): Promise<Skill> {
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      owner: { id: userId },
      category: { id: createSkillDto.category },
    });
    return this.skillsRepository.save(skill);
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: UUID,
  ): Promise<Skill> {
    const skill = await this.findOne(id);

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы можете обновлять только свои навыки');
    }

    const updatedSkill = this.skillsRepository.merge(skill, {
      title: updateSkillDto.title,
      description: updateSkillDto.description,
      images: updateSkillDto.images,
    });

    if (updateSkillDto.category !== undefined) {
      updatedSkill.category = { id: updateSkillDto.category } as Category;
    }

    return this.skillsRepository.save(updatedSkill);
  }

  async remove(id: string, userId: UUID): Promise<void> {
    const skill = await this.findOne(id);

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои навыки');
    }

    // Удаление соответствующих изображений
    await Promise.all(
      skill.images.map((image) => {
        const imagePath = join(process.cwd(), 'uploads', image);
        return unlink(imagePath).catch(() => null); // Игнорируем ошибки при удалении
      }),
    );

    await this.skillsRepository.remove(skill);
  }

  async addToFavorite(userId: string, skillId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const skill = await this.skillsRepository.findOneBy({ id: skillId });
    if (!skill) throw new NotFoundException('Навык не найден');

    const alreadyFavorite = user.favoriteSkills?.some((s) => s.id === skillId);
    if (alreadyFavorite) throw new ConflictException('Навык уже в избранном');

    user.favoriteSkills = [...(user.favoriteSkills || []), skill];
    await this.userRepository.save(user);
    return { message: 'Навык добавлен в избранное' };
  }

  async removeFromFavorite(userId: string, skillId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const updateFavorites = (user.favoriteSkills || []).filter(
      (s) => s.id !== skillId,
    );
    if (updateFavorites.length === user.favoriteSkills?.length) {
      throw new NotFoundException('Навык не найден в избранном');
    }

    user.favoriteSkills = updateFavorites;
    await this.userRepository.save(user);

    return { message: 'Навык удален из избранного' };
  }
}
