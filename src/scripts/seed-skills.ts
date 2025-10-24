import { AppDataSource } from '../config/ormconfig';
import { Skill } from '../entities/skill.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/roles.enum';

const skillsData = [
  {
    title: 'Разработка сайтов на React',
    description:
      'Помогу освоить React, Redux, Next.js. Научу создавать современные веб-приложения.',
    categoryName: 'Веб-разработка',
  },
  {
    title: 'Создание логотипов в Adobe Illustrator',
    description:
      'Научу основам работы в Illustrator, созданию векторной графики и логотипов.',
    categoryName: 'Графический дизайн',
  },
  {
    title: 'Продвижение в Instagram',
    description:
      'Расскажу, как создавать контент, привлекать подписчиков и настраивать рекламу в Instagram.',
    categoryName: 'SMM',
  },
  {
    title: 'Обработка фотографий в Lightroom',
    description:
      'Покажу, как улучшить ваши фотографии с помощью Adobe Lightroom. Цветокоррекция, ретушь и многое другое.',
    categoryName: 'Фотография',
  },
  {
    title: 'Разработка мобильных приложений на Flutter',
    description:
      'Научу создавать кроссплатформенные мобильные приложения для iOS и Android с помощью фреймворка Flutter.',
    categoryName: 'Мобильная разработка',
  },
  {
    title: 'Настройка контекстной рекламы в Яндекс.Директ',
    description:
      'Помогу разобраться в настройке и ведении рекламных кампаний в Яндекс.Директ. Сбор семантики, написание объявлений, аналитика.',
    categoryName: 'Контекстная реклама',
  },
];

async function seedSkills() {
  await AppDataSource.initialize();
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

  for (const skillData of skillsData) {
    const category = categories.find((c) => c.name === skillData.categoryName);
    if (!category) {
      console.warn(
        `⚠️ Категория "${skillData.categoryName}" не найдена. Пропускаем навык "${skillData.title}".`,
      );
      continue;
    }

    // Выбираем случайного пользователя
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const skill = skillRepo.create({
      ...skillData,
      category: category,
      owner: randomUser,
    });

    await skillRepo.save(skill);
    console.log(
      `✅ Создан навык: "${skill.title}" в категории "${category.name}" для пользователя ${randomUser.email}`,
    );
  }

  console.log('🎉 Загрузка навыков успешно завершена!');
}

seedSkills()
  .catch((error) => console.error('❌ Ошибка при загрузке навыков:', error))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      AppDataSource.destroy();
    }
  });
