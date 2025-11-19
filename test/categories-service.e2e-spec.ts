import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';
import { CategoriesService } from '@/categories/categories.service';
import { CreateCategoryDto } from '@/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '@/categories/dto/update-category.dto';

describe('Categories Service', () => {
  let categoriesService: CategoriesService;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.ENABLE_WS = 'false';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    categoriesService = moduleRef.get(CategoriesService);
    dataSource = moduleRef.get(DataSource);
    await dataSource.runMigrations();

    // Clear categories table
    try {
      await dataSource.query(
        'TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE',
      );
    } catch {
      // Ignore if table doesn't exist
    }
  });

  afterAll(async () => {
    // Close the database connection
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should create a category', async () => {
    const createDto: CreateCategoryDto = {
      name: 'Test Category',
    };

    const category = await categoriesService.create(createDto);
    expect(category).toBeDefined();
    expect(category.name).toBe('Test Category');
    expect(category.id).toBeDefined();
  });

  it('should get all categories', async () => {
    const categories = await categoriesService.findAll();
    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should update a category', async () => {
    // First create a category
    const createDto: CreateCategoryDto = {
      name: 'Original Name',
    };
    const category = await categoriesService.create(createDto);

    // Then update it
    const updateDto: UpdateCategoryDto = {
      name: 'Updated Name',
    };
    const updatedCategory = await categoriesService.update(
      category.id,
      updateDto,
    );

    expect(updatedCategory).toBeDefined();
    expect(updatedCategory.name).toBe('Updated Name');
  });

  it('should delete a category', async () => {
    // First create a category
    const createDto: CreateCategoryDto = {
      name: 'Category to Delete',
    };
    const category = await categoriesService.create(createDto);

    // Then delete it
    await categoriesService.remove(category.id);

    // Verify it's deleted
    const categories = await categoriesService.findAll();
    const deletedCategory = categories.find((c) => c.id === category.id);
    expect(deletedCategory).toBeUndefined();
  });
});
