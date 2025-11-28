import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AppModule } from '@/app.module';
import { PasswordDto } from '@/auth/dto/password.dto';
import { User } from '@/entities/user.entity';
import { Gender, UserRole } from '@/enums';
import { testUsers } from '@/scripts/seed-users.data';
import { FindSkillsQueryDto } from '@/skills/dto/find-skills.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { UUID } from 'crypto';
import { Skill } from '@/entities/skill.entity';
import { CreateSkillDto } from '@/skills/dto/create-skill.dto';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: UUID;
  let userEmail: string;
  let server: any;
  let token: any;
  let userPassword: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);

    // Очищаем базу перед запуском тестов
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    server = app.getHttpServer() as unknown as App;

    // Создаем тестового пользователя с правильным хешированием пароля
    const userRepo = dataSource.getRepository(User);
    userEmail = 'test@example.com';
    userPassword = 'password123';

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const testUser = userRepo.create({
      name: 'Test User',
      email: userEmail,
      password: hashedPassword,
      gender: Gender.UNKNOWN,
      role: UserRole.USER,
    });

    await userRepo.save(testUser);
    userId = testUser.id;

    // Логинимся
    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Очищаем связанные таблицы перед каждым тестом если нужно
  });

  afterEach(async () => {
    // Дополнительная очистка если нужна
  });

  it('GET /users -> [] | [user]', async () => {
    const repo = dataSource.getRepository(User);

    // Создаем дополнительного пользователя для теста
    const user = repo.create({
      name: 'Second Test User',
      email: 'test2@example.com',
      password: await bcrypt.hash('hashed', 10),
      gender: Gender.UNKNOWN,
      role: UserRole.USER,
    });
    await repo.save(user);

    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`); // Добавляем авторизацию

    expect(res.status).toBe(200);

    const body = res.body as {
      data: Array<{ id: string; email: string }>;
      count: number;
    };

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    // Проверяем что наш пользователь есть в списке
    expect(body.data.some((u) => u.email === 'test2@example.com')).toBe(true);
  });

  it('GET /users/:id -> user', async () => {
    const repo = dataSource.getRepository(User);
    const created = await repo.save(
      repo.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: await bcrypt.hash('hashed', 10),
        gender: Gender.UNKNOWN,
        role: UserRole.USER,
      }),
    );

    const res = await request(server)
      .get(`/users/${String(created.id)}`)
      .set('Authorization', `Bearer ${token}`); // Добавляем авторизацию

    expect(res.status).toBe(200);
    const body = res.body as { id: string; email: string };
    expect(body.id).toBe(created.id);
    expect(body.email).toBe('user2@example.com');
  });

  it('обновление данных пользователя', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Test User updated Name',
      city: 'Test updated City',
    };

    const res = await request(server)
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send(updateUserDto)
      .expect(200);

    expect(res.body.name).toEqual(updateUserDto.name);
  });

  it('обновление пароля', async () => {
    const updatePasswordDto: PasswordDto = {
      currentPassword: userPassword, // Используем оригинальный пароль
      newPassword: 'user12345@',
    };

    const res = await request(server)
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send(updatePasswordDto)
      .expect(200);
    expect(res.body.message).toEqual('Пароль успешно обновлен');

    // Обновляем пароль для последующих тестов
    userPassword = updatePasswordDto.newPassword;
  });

  it('поиск пользователя по навыку', async () => {
    // Сначала создаем тестовые данные для навыков
    const skillsRepo = dataSource.getRepository(Skill);

    // Создаем тестовый навык
    const createSkillDto: CreateSkillDto = {
      title: 'test',
      category: 'test',
      images: [],
    };
    const skillResponse: Skill = await request(server)
      .post('/skills')
      .set('Authorization', `Bearer ${token}`)
      .send(createSkillDto)
      .then((res) => res.body);

    const query: FindSkillsQueryDto = {
      page: 1,
      limit: 20,
    };

    const res = await request(server)
      .get(`/users/by-skill/${skillResponse.id}`)
      .set('Authorization', `Bearer ${token}`) // Добавляем авторизацию
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
