import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const category: Category = {
    id: '1',
    name: 'Frontend',
    parentId: null as any,
    parent: null as any,
    children: [],
    skills: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([category]),
            create: jest.fn().mockResolvedValue(category),
            update: jest.fn().mockResolvedValue(category),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should return all categories', async () => {
    const result = await controller.getAllCategories();
    expect(result).toEqual([category]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should create a category', async () => {
    const dto = { name: 'Backend' };
    const result = await controller.createCategory(dto as any);
    expect(result).toEqual(category);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update a category', async () => {
    const dto = { name: 'Frontend Updated' };
    const result = await controller.updateCategory('1', dto as any);
    expect(result).toEqual(category);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('should delete a category', async () => {
    await controller.deleteCategory('1');
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
