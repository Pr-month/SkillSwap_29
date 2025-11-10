import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Category } from '@/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  const categoryArray: Category[] = [
    {
      id: '1',
      name: 'Frontend',
      parentId: null as unknown as string,
      parent: null as unknown as Category,
      children: [],
      skills: [],
    } as Category,
    {
      id: '2',
      name: 'Backend',
      parentId: null as unknown as string,
      parent: null as unknown as Category,
      children: [],
      skills: [],
    } as Category,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue({} as Category),
            save: jest.fn().mockResolvedValue({} as Category),
            remove: jest.fn().mockResolvedValue({} as Category),
            merge: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  describe('findAll', () => {
    it('should return all top-level categories with children', async () => {
      (repo.find as jest.Mock).mockResolvedValue(categoryArray);
      const result = await service.findAll();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(categoryArray);
    });
  });

  describe('findOne', () => {
    it('should return one category by id', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(categoryArray[0]);
      const result = await service.findOne('1');
      expect(result).toEqual(categoryArray[0]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      const qbMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qbMock);
    });

    it('should create category without parent', async () => {
      const dto: CreateCategoryDto = { name: 'DevOps' };
      const created = { id: '3', ...dto } as Category;

      (repo.create as jest.Mock).mockReturnValue(created);
      (repo.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should throw ConflictException if category with same name exists at same level', async () => {
      const dto: CreateCategoryDto = { name: 'DevOps' };
      (repo.createQueryBuilder().getOne as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'DevOps',
      } as Category);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if parent not found', async () => {
      const dto: CreateCategoryDto = { name: 'React', parentId: '100' };
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create category with valid parent', async () => {
      const dto: CreateCategoryDto = { name: 'React', parentId: '1' };
      const parent = { id: '1', name: 'Frontend' } as Category;
      const created = { id: '3', ...dto } as unknown as Category;

      (repo.findOne as jest.Mock).mockResolvedValue(parent);
      (repo.create as jest.Mock).mockReturnValue(created);
      (repo.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.create).toHaveBeenCalledWith(dto); // Service calls create with DTO
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const dto: UpdateCategoryDto = { name: 'Backend Updated' };
      const existing = { id: '2', name: 'Backend' } as Category;
      const updated = { ...existing, ...dto };

      (repo.findOne as jest.Mock).mockResolvedValue(existing);
      (repo.save as jest.Mock).mockResolvedValue(updated);

      const result = await service.update('2', dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
      // Check that save is called with the updated object
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException if parent not found', async () => {
      const dto: UpdateCategoryDto = { parentId: '100' };
      const existingCategory = { id: '2', name: 'Test' } as Category;

      (repo.findOne as jest.Mock).mockResolvedValueOnce(existingCategory);
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.update('2', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if category to update is not found', async () => {
      const dto: UpdateCategoryDto = { name: 'New Name' };
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.update('999', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove category', async () => {
      const cat = { id: '1', name: 'Frontend' } as Category;
      jest.spyOn(service, 'findOne').mockResolvedValue(cat);
      (repo.remove as jest.Mock).mockResolvedValue({} as Category);

      await service.remove('1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repo.remove).toHaveBeenCalledWith(cat);
    });
  });
});
