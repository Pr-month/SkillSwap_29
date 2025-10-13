import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { User } from '../entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async findAll(query: any): Promise<{ data: Skill[]; count: number }> {
    const { category, search, limit = 20, offset = 0 } = query;
    const options: FindManyOptions<Skill> = {
      take: +limit,
      skip: +offset,
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    };

    if (category) {
      options.where = { category };
    }

    if (search) {
      options.where = {
        ...options.where,
        title: Like(`%${search}%`),
      };
    }

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

  async create(createSkillDto: CreateSkillDto, user: User): Promise<Skill> {
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      owner: user,
    });
    return this.skillsRepository.save(skill);
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ): Promise<Skill> {
    const skill = await this.findOne(id);

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы можете обновлять только свои навыки');
    }

    return this.skillsRepository.save({
      ...skill,
      ...updateSkillDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
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
}
