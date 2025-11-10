import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
<<<<<<< HEAD
import { Category } from '../entities/category.entity';
=======
import { Category } from '@/entities/category.entity';
>>>>>>> 02ea7935a218a11edc673c489421c62a5d4b85a8
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;

    const qb = this.categoryRepository.createQueryBuilder('category');
    qb.where('LOWER(category.name) = LOWER(:name)', { name });

    if (parentId) {
      qb.andWhere('category.parentId = :parentId', { parentId });
    } else {
      qb.andWhere('category.parentId IS NULL');
    }

    const existingCategory = await qb.getOne();

    if (existingCategory) {
      throw new ConflictException(
        `Категория с названием "${name}" уже существует на этом уровне.`,
      );
    }

    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (!parentCategory) {
        throw new BadRequestException(
          `Родительская категория с ID ${parentId} не найдена`,
        );
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Загружаем категорию без связей, чтобы избежать конфликтов при обновлении
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }

    if (updateCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new BadRequestException(
          `Родительская категория с ID ${updateCategoryDto.parentId} не найдена`,
        );
      }
    }

    // Вместо использования merge, напрямую присваиваем свойства
    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
