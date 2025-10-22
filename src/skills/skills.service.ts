import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, FindOptionsWhere } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';

@Injectable()
export class SkillsService {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async findAll(
    query: FindSkillsQueryDto,
  ): Promise<{ data: Skill[]; count: number }> {
    const { page, limit, category, search } = query;
    const offset = (page - 1) * limit;

    const where: FindOptionsWhere<Skill> = {};

    if (category) {
      where.category = category;
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
