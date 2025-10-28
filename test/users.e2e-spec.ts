import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { User } from '@/entities/user.entity';
import { Gender } from '@/enums';
import { UserRole } from '@/enums';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();
  });

  beforeEach(async () => {
    // Очистка таблиц перед каждым тестом
    await dataSource.query(
      'TRUNCATE TABLE "user_favorite_skills", "user_skills", "users" RESTART IDENTITY CASCADE',
    );
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
    const res = await request(server).get('/users').expect(200);
    const body = res.body as Array<{ id: string; email: string }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0]?.email).toBe('test@example.com');
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
    const res = await request(server).get(`/users/${created.id}`).expect(200);
    const body = res.body as { id: string; email: string };
    expect(body.id).toBe(created.id as unknown as string);
    expect(body.email).toBe('user2@example.com');
  });
});
