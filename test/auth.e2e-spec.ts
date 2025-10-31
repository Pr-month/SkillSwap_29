import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import type { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { User } from '@/entities/user.entity';
import { Gender, UserRole } from '@/enums';

describe('Auth (e2e)', () => {
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
    await dataSource.query(
      'TRUNCATE TABLE "user_favorite_skills", "user_skills", "users" RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('Успешно регистрирует пользователя.', async () => {
      const dto = { email: 'test@example.com', password: '12345', name: 'Test' };
      const server = app.getHttpServer() as unknown as App;

      const res = await request(server)
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(res.body.user.email).toBe(dto.email);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает ConflictException если email уже существует.', async () => {
      const repo = dataSource.getRepository(User);
      await repo.save(
        repo.create({
          email: 'test@example.com',
          password: 'hashed',
          name: 'Test',
          gender: Gender.UNKNOWN,
          role: UserRole.USER,
        }),
      );

      const dto = { email: 'test@example.com', password: '12345', name: 'Test' };
      const server = app.getHttpServer() as unknown as App;

      await request(server)
        .post('/auth/register')
        .send(dto)
        .expect(409);
    });
  });

  describe('login', () => {
    it('Успешно логинит при корректных данных.', async () => {
      const repo = dataSource.getRepository(User);
      const password = '12345';
      const hashedPassword = await import('bcrypt').then(b => b.hash(password, 10));

      await repo.save(
        repo.create({
          email: 'login@example.com',
          password: hashedPassword,
          name: 'Login User',
          gender: Gender.UNKNOWN,
          role: UserRole.USER,
        }),
      );

      const dto = { email: 'login@example.com', password };
      const server = app.getHttpServer() as unknown as App;

      const res = await request(server)
        .post('/auth/login')
        .send(dto)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает UnauthorizedException если пользователь не найден.', async () => {
      const dto = { email: 'unknown@example.com', password: '12345' };
      const server = app.getHttpServer() as unknown as App;

      await request(server)
        .post('/auth/login')
        .send(dto)
        .expect(401);
    });

    it('Выбрасывает UnauthorizedException если пароль неверный.', async () => {
      const repo = dataSource.getRepository(User);
      const password = 'correct';
      const hashedPassword = await import('bcrypt').then(b => b.hash(password, 10));

      const user = await repo.save(
        repo.create({
          email: 'user@example.com',
          password: hashedPassword,
          name: 'User',
          gender: Gender.UNKNOWN,
          role: UserRole.USER,
        }),
      );

      const dto = { email: 'user@example.com', password: 'wrong' };
      const server = app.getHttpServer() as unknown as App;

      await request(server)
        .post('/auth/login')
        .send(dto)
        .expect(401);
    });
  });

  describe('refresh', () => {
    it('Успешно обновляет токены при валидном refreshToken.', async () => {
        const repo = dataSource.getRepository(User);
        const password = '12345';
        const hashedPassword = await import('bcrypt').then(b => b.hash(password, 10));

        await repo.save(
        repo.create({
            email: 'refresh@example.com',
            password: hashedPassword,
            name: 'Refresh User',
            gender: Gender.UNKNOWN,
            role: UserRole.USER,
        }),
        );

        const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'refresh@example.com', password })
        .expect(200);

        const refreshToken = loginRes.body.refreshToken;

        const user = await repo.findOneByOrFail({ email: 'refresh@example.com' });
        expect(user.refreshToken).toBeDefined();

        const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
        const repo = dataSource.getRepository(User);
        const password = '12345';
        const hashedPassword = await import('bcrypt').then(b => b.hash(password, 10));

        await repo.save(
        repo.create({
            email: 'refresh-invalid@example.com',
            password: hashedPassword,
            name: 'Refresh User',
            gender: Gender.UNKNOWN,
            role: UserRole.USER,
        }),
        );

        await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer wrongToken`)
        .expect(401);
    });
  });

  describe('logout', () => {
    it('Успешно очищает refreshToken.', async () => {
        const repo = dataSource.getRepository(User);
        const password = '12345';
        const hashedPassword = await import('bcrypt').then(b => b.hash(password, 10));

        const user = await repo.save(
        repo.create({
            email: 'logout@example.com',
            password: hashedPassword,
            name: 'Logout User',
            gender: Gender.UNKNOWN,
            role: UserRole.USER,
        }),
        );

        const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password })
        .expect(200);

        const accessToken = loginRes.body.accessToken;

        await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

        const updatedUser = await repo.findOneByOrFail({ id: user.id });
        expect(updatedUser.refreshToken).toBe('');
    });

    it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
        await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer wrongToken`)
        .expect(401);
    });
  });
});
