import { Test } from '@nestjs/testing';
import { INestApplication, ClassSerializerInterceptor } from '@nestjs/common';
import * as request from 'supertest';
import { testUsers } from '@/scripts/seed-users';
import { AppModule } from '@/app.module';
import { AllExceptionFilter } from '@/common/all-exception.filter';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import type { App } from 'supertest/types';
import { Skill } from '@/entities/skill.entity';

describe('RequestsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userEmail: string;
  let userPassword: string;
  let server: any;
  let loginResponse: any;
  let token: any;
  let createdRequestId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionFilter(httpAdapterHost));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();

    server = app.getHttpServer() as unknown as App;

    userEmail = 'admin@skillswap.com';
    userPassword = 'admin123';
   
/*
    loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);
*/
    //token = loginResponse.body.accessToken;
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYTA3MmM4YS05ZDFlLTQ4ZWMtYWY5Ny1jODA3M2EzMzc0NzEiLCJlbWFpbCI6ImFkbWluQHNraWxsc3dhcC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjMxMDQ3ODYsImV4cCI6MTc2MzEwODM4Nn0.BTQwTi-MAdvya73S1s_P6eOvTW9keJucZJwsdtWzKiY';
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /requests — успешно создаёт заявку', async () => {
    const repo = dataSource.getRepository(Skill);
    const skills = await repo.find();
    const response = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        offeredSkillId: skills[0],
        requestedSkillId: skills[1],
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    createdRequestId = response.body.id;
  });

  it('GET /requests/incoming — возвращает входящие заявки', async () => {
    const response = await request(app.getHttpServer())
      .get('/requests/incoming')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /requests/outgoing — возвращает исходящие заявки', async () => {
    const response = await request(app.getHttpServer())
      .get('/requests/outgoing')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PATCH /requests/:id/read — отмечает заявку как прочитанную', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/requests/${createdRequestId}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBeDefined();
  });

  it('PATCH /requests/:id/accept — принимает заявку', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/requests/${createdRequestId}/accept`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ACCEPTED');
  });

  it('PATCH /requests/:id/reject — отклоняет заявку', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/requests/${createdRequestId}/reject`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('REJECTED');
  });

  it('DELETE /requests/:id — удаляет заявку', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
