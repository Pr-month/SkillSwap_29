import { INestApplication, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
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
    expect(body.id).toBe(created.id as unknown as string);
    expect(body.email).toBe('user2@example.com');
  });
});
