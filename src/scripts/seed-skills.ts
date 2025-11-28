import { AppDataSource } from '@/config/db.config';
import { Skill } from '@/entities/skill.entity';
import { Category } from '@/entities/category.entity';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/roles.enum';
import { skillsData } from './seed-skills.data';

async function seedSkills() {
  await AppDataSource.initialize();
  AppDataSource.setOptions({ logging: false });
  const skillRepo = AppDataSource.getRepository(Skill);
  const categoryRepo = AppDataSource.getRepository(Category);
  const userRepo = AppDataSource.getRepository(User);

  const skillsCount = await skillRepo.count();
  if (skillsCount > 0) {
    console.log('ℹ️ Навыки уже были загружены. Пропускаем...');
    return;
  }

  const categories = await categoryRepo.find();
  if (categories.length === 0) {
    console.error(
      '❌ Категории не найдены. Пожалуйста, сначала запустите seed-categories.ts',
    );
    return;
  }

  const users = await userRepo.find({ where: { role: UserRole.USER } });
  if (users.length === 0) {
    console.error(
      '❌ Пользователи не найдены. Пожалуйста, сначала запустите seed-users.ts',
    );
    return;
  }

  console.log('🔄 Начинаем загрузку навыков...');

  // Используем индекс для циклического перебора пользователей
  let userIndex = 0;

  for (const skillData of skillsData) {
    // Выбираем случайную категорию из списка
    const randomCategoryIndex = Math.floor(Math.random() * categories.length);
    const category = categories[randomCategoryIndex];

    console.log(
      `✅ Навык "${skillData.title}" будет создан с категорией "${category.name}"`,
    );

    // Выбираем следующего пользователя по кругу
    const user = users[userIndex];
    userIndex = (userIndex + 1) % users.length;

    const skill = skillRepo.create({
      title: skillData.title,
      description: skillData.description,
      category: category,
      owner: user,
    });

    await skillRepo.save(skill);
    console.log(
      `✅ Создан навык: "${skill.title}" в категории "${category.name}" для пользователя ${user.email}`,
    );
  }

  console.log('🎉 Загрузка навыков успешно завершена!');
}

seedSkills()
  .catch((error) => console.error('❌ Ошибка при загрузке навыков:', error))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
