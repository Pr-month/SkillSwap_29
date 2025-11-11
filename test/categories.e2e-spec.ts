import { AppModule } from '@/app.module';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as dotenv from 'dotenv';
import { WsAdapter } from '@nestjs/platform-ws';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { AllExceptionFilter } from '@/common/all-exception.filter';

dotenv.config();
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWROD;

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useWebSocketAdapter(new WsAdapter(app));

    const httpAdatperHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdatperHost));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword });

    token = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  let createdCategoryId: string;

  it('POST /categories — should create a category', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'testCategory' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('testCategory');
    createdCategoryId = res.body.id;
  });

  it('GET /categories — should return all categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((cat) => cat.id === createdCategoryId)).toBe(true);
  });

  it('PATCH /categories/:id — should update category name', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'testCategory Updated' })
      .expect(200);

    expect(res.body.name).toBe('testCategory Updated');
  });

  it('DELETE /categories/:id — should delete category', async () => {
    await request(app.getHttpServer())
      .delete(`/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/categories')
      .expect(200)
      .then((res) => {
        expect(res.body.some((cat) => cat.id === createdCategoryId)).toBe(
          false,
        );
      });
  });
});
