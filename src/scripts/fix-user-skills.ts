import { AppDataSource } from '../config/db.config';
import { Skill } from '../entities/skill.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../enums/roles.enum';

async function fixUserSkills() {
  await AppDataSource.initialize();
  AppDataSource.setOptions({ logging: false });
  const skillRepo = AppDataSource.getRepository(Skill);
  const userRepo = AppDataSource.getRepository(User);

  try {
    console.log('🔄 Начинаем исправление связей навыков пользователей...');

    // Получаем всех пользователей
    const users = await userRepo.find({
      where: { role: UserRole.USER },
      relations: ['skills', 'wantToLearn'],
    });

    if (users.length === 0) {
      console.log('❌ Пользователи не найдены');
      return;
    }

    console.log(`👥 Найдено пользователей: ${users.length}`);

    // Получаем все навыки
    const skills = await skillRepo.find({
      relations: ['owner'],
    });

    if (skills.length === 0) {
      console.log('❌ Навыки не найдены');
      return;
    }

    console.log(`💡 Найдено навыков: ${skills.length}`);

    // Для каждого пользователя добавляем навыки в "Может научить" и "Хочет научиться"
    for (const user of users) {
      // Навыки, которые пользователь может преподавать (созданные им)
      const canTeachSkills = skills.filter(
        (skill) => skill.owner.id === user.id,
      );

      // Случайные навыки, которые пользователь хочет изучать (не созданные им)
      const wantToLearnSkills = skills
        .filter((skill) => skill.owner.id !== user.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3); // Выбираем до 3 случайных навыков

      console.log(`\n👤 Пользователь: ${user.name}`);
      console.log(`   Может научить: ${canTeachSkills.length} навыков`);
      console.log(`   Хочет научиться: ${wantToLearnSkills.length} навыков`);

      // Обновляем связи пользователя
      user.skills = canTeachSkills;
      user.wantToLearn = wantToLearnSkills;

      await userRepo.save(user);
      console.log(`✅ Обновлены связи для пользователя ${user.name}`);
    }

    console.log('\n🎉 Исправление связей навыков пользователей завершено!');
  } catch (error) {
    console.error('❌ Ошибка при исправлении связей навыков:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Запускаем функцию исправления связей
void fixUserSkills();
