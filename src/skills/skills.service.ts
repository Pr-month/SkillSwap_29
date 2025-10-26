import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, FindOptionsWhere, Equal } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) { }

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

  async create(createSkillDto: CreateSkillDto, userId: string): Promise<Skill> {
    const skill = this.skillsRepository.create({
      ...createSkillDto,
      owner: { id: userId },
      category: { id: createSkillDto.category }
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
