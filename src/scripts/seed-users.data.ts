import { Gender } from '@/enums/gender.enum';
import { UserRole } from '@/enums/roles.enum';

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

export const testUsers: UserData[] = [
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
