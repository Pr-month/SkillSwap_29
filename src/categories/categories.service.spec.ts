import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  const categoryArray: Category[] = [
    { id: '1', name: 'Frontend', parentId: null as any, parent: null as any, children: [], skills: [] },
    { id: '2', name: 'Backend', parentId: null as any, parent: null as any, children: [], skills: [] },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  describe('findAll', () => {
    it('should return all top-level categories with children', async () => {
      repo.find.mockResolvedValue(categoryArray);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        where: { parent: expect.anything() },
        relations: ['children'],
      });
      expect(result).toEqual(categoryArray);
    });
  });

  describe('findOne', () => {
    it('should return one category by id', async () => {
      repo.findOne.mockResolvedValue(categoryArray[0]);
      const result = await service.findOne('1');
      expect(result).toEqual(categoryArray[0]);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['parent', 'children'],
      });
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create category without parent', async () => {
      const dto = { name: 'DevOps' };
      const created = { id: '3', ...dto };

      repo.create.mockReturnValue(created as Category);
      repo.save.mockResolvedValue(created as Category);

      const result = await service.create(dto as any);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should throw BadRequestException if parent not found', async () => {
      const dto = { name: 'React', parentId: '100' };
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should create category with valid parent', async () => {
      const dto = { name: 'React', parentId: '1' };
      const parent = { id: '1', name: 'Frontend' } as Category;
      const created = { id: '3', ...dto } as Category;

      repo.findOne.mockResolvedValueOnce(parent);
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto as any);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const dto = { name: 'Backend Updated' };
      const existing = { id: '2', name: 'Backend' } as Category;
      const merged = { ...existing, ...dto } as Category;

      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      repo.merge.mockReturnValue(merged);
      repo.save.mockResolvedValue(merged);

      const result = await service.update('2', dto as any);
      expect(result).toEqual(merged);
    });

    it('should throw BadRequestException if parent not found', async () => {
      const dto = { parentId: '100' };
      jest.spyOn(service, 'findOne').mockResolvedValue({ id: '2' } as Category);
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.update('2', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove category', async () => {
      const cat = { id: '1', name: 'Frontend' } as Category;
      jest.spyOn(service, 'findOne').mockResolvedValue(cat);
      repo.remove.mockResolvedValue({} as Category);

      await service.remove('1');
      expect(repo.remove).toHaveBeenCalledWith(cat);
    });
  });
});
