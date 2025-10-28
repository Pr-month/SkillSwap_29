import { AppDataSource } from '@/config/db.config';
import { Category } from '@/entities/category.entity';
import { categoriesData } from './seed-categories.data';

async function seedCategories() {
  await AppDataSource.initialize();
  AppDataSource.setOptions({ logging: false });
  const categoryRepo = AppDataSource.getRepository(Category);

  const count = await categoryRepo.count();
  if (count > 0) {
    console.log('ℹ️ Категории уже были загружены. Пропускаем...');
    return;
  }

  console.log('🔄 Начинаем загрузку категорий...');

  for (const catData of categoriesData) {
    const parentCategory = categoryRepo.create({ name: catData.name });
    await categoryRepo.save(parentCategory);
    console.log(`✅ Создана категория: ${parentCategory.name}`);

    if (catData.children) {
      for (const childData of catData.children) {
        const childCategory = categoryRepo.create({
          name: childData.name,
          parent: parentCategory,
        });
        await categoryRepo.save(childCategory);
        console.log(`  ✅ Создана подкатегория: ${childCategory.name}`);
      }
    }
  }

  console.log('🎉 Загрузка категорий успешно завершена!');
}

seedCategories()
  .catch((error) => console.error('❌ Ошибка при загрузке категорий:', error))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
