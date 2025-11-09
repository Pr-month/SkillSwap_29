import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import type { App } from 'supertest/types';
import { SkillsService } from '@/skills/skills.service';
import { CategoriesService } from '@/categories/categories.service';
import { AppModule } from '@/app.module';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { CreateSkillDto } from '@/skills/dto/create-skill.dto';
import { FindSkillsQueryDto } from '@/skills/dto/find-skills.dto';
import { UpdateSkillDto } from '@/skills/dto/update-skill.dto';
import { UUID } from 'crypto';
import { Category } from '@/categories/entities/category.entity';
import { UsersService } from '@/users/users.service';

describe('Skills тесты (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let skillsService: SkillsService;
  let createdSkill: Skill;
  let categoryService: CategoriesService;
  let userService: UsersService;
  let userId: UUID;
  let categories: Category[];
  let category: Category;
  let server: any;
  let loginResponse: any;
  let token: any;
  let user: User;
  let userEmail: string;
  let userPassword: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.runMigrations();

    skillsService = app.get(SkillsService);
    const { data } = await skillsService.findAll({ page: 1, limit: 20 });

    userId = data[0].owner.id;
    categoryService = app.get(CategoriesService);
    categories = await categoryService.findAll();
    category = categories[0];

    userService = app.get(UsersService);
    user = await userService.findOneById(userId);
    userEmail = user.email;
    userPassword = 'user123';
  });

  beforeEach(async () => {
    server = app.getHttpServer() as unknown as App;

    loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword })
      .expect(200);

    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    console.log('Closing app:', app);
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
    const res = await request(server).get('/skills').send(query).expect(200);

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
      .expect(200);

    expect(res.body.message).toEqual('Навык удален из избранного');
  });

  it('тестируем удаление навыка', async () => {
    const res = await request(server)
      .delete(`/skills/${createdSkill.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const resCheck = await request(server)
      .get(`/skills/${createdSkill.id}`)
      .expect(404);
    expect(resCheck.body.message).toEqual(
      `Навык с ID ${createdSkill.id} не найден`,
    );
  });
});
