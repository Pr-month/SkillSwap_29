import { INestApplication, ClassSerializerInterceptor } from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { AllExceptionFilter } from '@/common/all-exception.filter';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import type { App } from 'supertest/types';
import { CategoriesService } from '@/categories/categories.service';
import { AppModule } from '@/app.module';
import { Skill } from '@/entities/skill.entity';
import { CreateSkillDto } from '@/skills/dto/create-skill.dto';
import { FindSkillsQueryDto } from '@/skills/dto/find-skills.dto';
import { UpdateSkillDto } from '@/skills/dto/update-skill.dto';
import { UUID } from 'crypto';
import { testUsers } from '@/scripts/seed-users.data';
import { Category } from '@/entities/category.entity';

describe('Skills тесты (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdSkill: Skill;
  let categoriesService: CategoriesService;
  let userId: UUID;
  let categories: Category[];
  let category: Category;
  let server: any;
  let loginResponse: any;
  let token: any;
  let userEmail: string;
  let userPassword: string;

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

    userEmail = testUsers[0].email;
    userPassword = testUsers[0].password;

    loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);

    token = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;

    categoriesService = app.get(CategoriesService);
    categories = await categoriesService.findAll();
    category = categories[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('тестируем создание навыка', async () => {
    const createSkillDto: CreateSkillDto = {
      title: 'Test title',
      description: 'Test description',
      category: category.id,
      images: ['test1.jpg'],
    };

    const res = await request(server)
      .post('/skills')
      .set('Authorization', `Bearer ${token}`)
      .send(createSkillDto)
      .expect(201);

    createdSkill = res.body;

    expect(res.body.title).toEqual('Test title');
  });

  it('тестируем поиск навыка', async () => {
    const res = await request(server)
      .get(`/skills/${createdSkill.id}`)
      .expect(200);
    expect(res.body.title).toEqual('Test title');
  });

  it('тестируем поиск всех навыков', async () => {
    const query: FindSkillsQueryDto = {
      page: 1,
      limit: 20,
    };

    const res = await request(server).get('/skills').query(query).expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.count).toBeDefined();
  });

  it('тестируем обновление навыка', async () => {
    const updateSkillDto: UpdateSkillDto = {
      title: 'Test title update',
      description: 'Test new description update',
    };

    const res = await request(server)
      .patch(`/skills/${createdSkill.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...updateSkillDto, userId: userId })
      .expect(200);

    expect(res.body.title).toEqual('Test title update');
  });

  it('тестируем добавление навыка в избранное', async () => {
    const res = await request(server)
      .post(`/skills/${createdSkill.id}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send(createdSkill.id)
      .expect(201);

    expect(res.body.message).toEqual('Навык добавлен в избранное');
  });

  it('тестируем удаление навыка из избранного', async () => {
    const res = await request(server)
      .delete(`/skills/${createdSkill.id}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send(createdSkill.id)
      .expect(204);
  });

  it('тестируем удаление навыка', async () => {
    const res = await request(server)
      .delete(`/skills/${createdSkill.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const resCheck = await request(server)
      .get(`/skills/${createdSkill.id}`)
      .expect(404);
    expect(resCheck.body.message).toEqual(
      `Навык с ID ${createdSkill.id} не найден`,
    );
  });
});
