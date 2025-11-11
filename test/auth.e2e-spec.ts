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
  let server: App;
  let dto: { email: string; password: string; name: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();

    server = app.getHttpServer() as unknown as App;

    dto = { email: 'test@example.com', password: '12345', name: 'Test User' };
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('Успешно регистрирует пользователя.', async () => {
      const res = await request(server).post('/auth/register').send(dto).expect(201);

      expect(res.body.user.email).toBe(dto.email);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает ConflictException если email уже существует.', async () => {
      await request(server).post('/auth/register').send(dto).expect(409);
    });
  });

  describe('login', () => {
    it('Успешно логинит при корректных данных.', async () => {
      const res = await request(server).post('/auth/login').send({
        email: dto.email,
        password: dto.password,
      }).expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает UnauthorizedException если пользователь не найден.', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: '12345' })
        .expect(401);
    });

    it('Выбрасывает UnauthorizedException если пароль неверный.', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: dto.email, password: 'wrong' })
        .expect(401);
    });
  });

  describe('refresh', () => {
    it('Успешно обновляет токены при валидном refreshToken.', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: dto.email, password: dto.password })
        .expect(200);

      const refreshToken = loginRes.body.refreshToken;

      const res = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer wrongToken`)
        .expect(401);
    });
  });

  describe('logout', () => {
    it('Успешно очищает refreshToken.', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: dto.email, password: dto.password })
        .expect(200);

      const accessToken = loginRes.body.accessToken;

      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const repo = dataSource.getRepository(User);
      const user = await repo.findOneByOrFail({ email: dto.email });
      expect(user.refreshToken).toBe('');
    });

    it('Выбрасывает UnauthorizedException при неверном токене.', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer wrongToken`)
        .expect(401);
    });
  });
});
