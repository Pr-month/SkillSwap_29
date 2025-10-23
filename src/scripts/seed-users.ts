import { User } from '../entities/user.entity';
import { Gender } from '../enums/gender.enum';
import { AppDataSource } from '../config/ormconfig';
import { UserRole } from '../enums/roles.enum';
import * as bcrypt from 'bcrypt';
import { appConfig } from '../config/app.config';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  about?: string;
  city?: string;
  gender: Gender;
  birthdate?: Date;
  avatar?: string;
}

const users: UserData[] = [
  // Администратор
  {
    name: 'Администратор Системы',
    email: 'admin@skillswap.com',
    password: 'admin123',
    role: UserRole.ADMIN,
    about: 'Системный администратор платформы',
    city: 'Москва',
    gender: Gender.UNKNOWN,
    birthdate: new Date('1990-01-01'),
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  // Обычные пользователи
  {
    name: 'Иван Петров',
    email: 'ivan@example.com',
    password: 'user123',
    role: UserRole.USER,
    about: 'Фронтенд разработчик, учу React и современный JavaScript',
    city: 'Санкт-Петербург',
    gender: Gender.MALE,
    birthdate: new Date('1992-05-15'),
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    name: 'Анна Сидорова',
    email: 'anna@example.com',
    password: 'user123',
    role: UserRole.USER,
    about: 'Дизайнер интерфейсов, учу английский язык',
    city: 'Екатеринбург',
    gender: Gender.FEMALE,
    birthdate: new Date('1995-08-22'),
    avatar: 'https://i.pravatar.cc/150?img=45',
  },
  {
    name: 'Алексей Иванов',
    email: 'alex@example.com',
    password: 'user123',
    role: UserRole.USER,
    about: 'Бэкенд разработчик, учу TypeScript и Node.js',
    city: 'Новосибирск',
    gender: Gender.MALE,
    birthdate: new Date('1991-11-30'),
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
  {
    name: 'Мария Кузнецова',
    email: 'maria@example.com',
    password: 'user123',
    role: UserRole.USER,
    about: 'Маркетолог, учу копирайтинг и SMM',
    city: 'Казань',
    gender: Gender.FEMALE,
    birthdate: new Date('1993-04-18'),
    avatar: 'https://i.pravatar.cc/150?img=22',
  },
  {
    name: 'Дмитрий Смирнов',
    email: 'dmitry@example.com',
    password: 'user123',
    role: UserRole.USER,
    about: 'Фотограф, учу видеомонтаж в Adobe Premiere Pro',
    city: 'Сочи',
    gender: Gender.MALE,
    birthdate: new Date('1994-07-25'),
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
];

async function seed() {
  try {
    console.log('🔄 Начало заполнения базы данных тестовыми пользователями...');

    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    // Проверяем, есть ли уже пользователи в базе
    const userCount = await userRepo.count();
    if (userCount > 0) {
      console.log(
        'ℹ️  В базе данных уже есть пользователи. Заполнение пропущено.',
      );
      return;
    }

    console.log('👥 Создание пользователей...');

    // Создаем пользователей с хешированными паролями
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(
        userData.password,
        appConfig().bcryptSalt,
      );
      const user = userRepo.create({
        ...userData,
        password: hashedPassword,
      });
      await userRepo.save(user);
      console.log(
        `✅ Создан пользователь: ${userData.email} (${userData.role === UserRole.ADMIN ? 'Администратор' : 'Пользователь'})`,
      );
    }

    console.log('🎉 Заполнение базы данных успешно завершено!');
    console.log('🔑 Данные для входа администратора:');
    console.log('📧 Email: admin@skillswap.com');
    console.log('🔐 Пароль: admin123');
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Запускаем функцию заполнения базы данных
seed();
