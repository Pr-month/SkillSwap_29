import { User } from '@/entities/user.entity';
import { Gender } from '@/enums/gender.enum';
import { AppDataSource } from '@/config/db.config';
import { UserRole } from '@/enums/roles.enum';
import * as bcrypt from 'bcrypt';
import { appConfig } from '@/config/app.config';
import { testUsers } from './seed-users.data';

// Этот скрипт предназначен для заполнения базы тестовыми пользователями
// Используется только в целях разработки и тестирования
console.log('🔄 Запуск сида тестовых пользователей...');

async function seedTestUsers() {
  try {
    await AppDataSource.initialize();
    AppDataSource.setOptions({ logging: false });
    const userRepo = AppDataSource.getRepository(User);

    console.log('👥 Создание тестовых пользователей...');

    // Создаем тестовых пользователей с хешированными паролями
    for (const userData of testUsers) {
      // Проверяем, существует ли уже пользователь с таким email
      const existingUser = await userRepo.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        console.log(
          `ℹ️  Пользователь с email ${userData.email} уже существует, пропускаем.`,
        );
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        userData.password,
        appConfig().bcryptSalt,
      );

      const user = userRepo.create({
        ...userData,
        password: hashedPassword,
      });

      await userRepo.save(user);
      console.log(`✅ Создан тестовый пользователь: ${userData.email}`);
    }

    console.log('🎉 Заполнение тестовыми пользователями завершено!');
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых пользователей:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Запускаем функцию заполнения тестовыми пользователями
void seedTestUsers();
