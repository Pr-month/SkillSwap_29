import { AppDataSource } from '../config/ormconfig';
import { Category } from '../entities/category.entity';

interface CategoryData {
  name: string;
  children?: CategoryData[];
}

const categoriesData: CategoryData[] = [
  {
    name: 'IT и программирование',
    children: [
      { name: 'Веб-разработка' },
      { name: 'Мобильная разработка' },
      { name: 'Тестирование и QA' },
      { name: 'Gamedev' },
    ],
  },
  {
    name: 'Дизайн',
    children: [
      { name: 'Веб-дизайн' },
      { name: 'Графический дизайн' },
      { name: 'UX/UI дизайн' },
    ],
  },
  {
    name: 'Маркетинг и реклама',
    children: [
      { name: 'SMM' },
      { name: 'Контекстная реклама' },
      { name: 'Копирайтинг' },
    ],
  },
  {
    name: 'Хобби',
    children: [
      { name: 'Фотография' },
      { name: 'Музыка' },
      { name: 'Рисование' },
    ],
  },
];

async function seedCategories() {
  await AppDataSource.initialize();
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
      AppDataSource.destroy();
    }
  });
