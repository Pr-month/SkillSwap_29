import { AppDataSource } from '@/config/ormconfig';
import { appConfig } from '@/config/app.config';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/roles.enum';
import { Gender } from '@/enums/gender.enum';
import * as bcrypt from 'bcrypt';

// Получаем данные администратора из переменных окружения
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@skillswap.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Проверяем наличие обязательных переменных окружения
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn(
    '⚠️  Внимание: Используются значения по умолчанию для учетной записи администратора.',
  );
  console.warn(
    '   Для продакшена установите переменные окружения ADMIN_EMAIL и ADMIN_PASSWORD',
  );
}

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

const adminUser: UserData = {
  name: 'Администратор Системы',
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: UserRole.ADMIN,
  about: 'Системный администратор платформы',
  city: 'Москва',
  gender: Gender.UNKNOWN,
  birthdate: new Date('1990-01-01'),
  avatar: 'https://i.pravatar.cc/150?img=1',
};

async function seedAdmin() {
  try {
    console.log('🔄 Начало создания администратора...');

    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);

    // Проверяем, есть ли уже администратор в базе
    const existingAdmin = await userRepo.findOne({
      where: { email: adminUser.email },
    });
    if (existingAdmin) {
      console.log(
        `ℹ️  Администратор с email ${adminUser.email} уже существует.`,
      );
      return;
    }

    console.log('👤 Создание администратора...');

    const hashedPassword = await bcrypt.hash(
      adminUser.password,
      appConfig().bcryptSalt,
    );

    const user = userRepo.create({
      ...adminUser,
      password: hashedPassword,
    });

    await userRepo.save(user);

    console.log('🎉 Администратор успешно создан!');
    console.log('🔑 Данные для входа:');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔐 Пароль: ${adminUser.password}`);
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

// Запускаем функцию создания администратора
void seedAdmin();
