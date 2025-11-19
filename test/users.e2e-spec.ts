import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { UsersQueryDto } from '@/users/dto/users-query.dto';
import { testUsers } from '@/scripts/seed-users.data';
import { UUID } from 'crypto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { PasswordDto } from '@/auth/dto/password.dto';
import { FindSkillsQueryDto } from '@/skills/dto/find-skills.dto';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: UUID;
  let userEmail: string;
  let server: any;
  let token: any;
  let loginResponse: any;
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
    await dataSource.runMigrations();

    server = app.getHttpServer() as unknown as App;

    userEmail = testUsers[0].email;
    userPassword = testUsers[0].password;

    loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);

    token = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users -> [] | [user]', async () => {
    const repo = dataSource.getRepository(User);
    const user = repo.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
      gender: Gender.UNKNOWN,
      role: UserRole.USER,
    });
    await repo.save(user);

    const server = app.getHttpServer() as unknown as App;
    const res = await request(server).get('/users');
    if (res.status !== 200) {
      throw new Error(`GET /users failed: ${JSON.stringify(res.body)}`);
    }
    const body = res.body as {
      data: Array<{ id: string; email: string }>;
      count: number;
    };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.email).toBe('test@example.com');
  });

  it('GET /users/:id -> user', async () => {
    const repo = dataSource.getRepository(User);
    const created = await repo.save(
      repo.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hashed',
        gender: Gender.UNKNOWN,
        role: UserRole.USER,
      }),
    );

    const server = app.getHttpServer() as unknown as App;
    const res = await request(server).get(`/users/${String(created.id)}`);
    if (res.status !== 200) {
      throw new Error(`GET /users/:id failed: ${JSON.stringify(res.body)}`);
    }
    const body = res.body as { id: string; email: string };
    expect(body.id).toBe(userId as unknown as string);
    expect(body.email).toBe(userEmail);
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
      currentPassword: userPassword,
      newPassword: 'user12345',
    };

    const res = await request(server)
      .patch('/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send(updatePasswordDto)
      .expect(200);

    expect(res.body.message).toEqual('Пароль успешно обновлен');
  });

  it('поиск пользователя по навыку', async () => {
    const query: FindSkillsQueryDto = {
      page: 1,
      limit: 20,
    };

    const resSkills = await request(server).get('/skills').query(query);
    const skillId = resSkills.body.data[0].id;

    const res = await request(server)
      .get(`/users/by-skill/${skillId}`)
      .expect(200);
  });
});
