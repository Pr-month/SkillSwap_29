// test/files.e2e-spec.ts
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { FilesModule } from '../src/files/files.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { fileConfig } from '../src/config/file.config';
import { existsSync, unlinkSync } from 'fs';

describe('FilesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [fileConfig],
        }),
        FilesModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should upload a valid file and return public URL', async () => {
    const testFilePath = join(__dirname, 'test-files', 'valid-image.jpg');

    const response = await request(app.getHttpServer())
      .post('/files')
      .attach('file', testFilePath)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toMatch(
      /http:\/\/localhost:3000\/public\/.+\.jpg/,
    );

    // Удалим файл после теста
    const filename = response.body.url.split('/').pop();
    const savedPath = join(process.cwd(), 'public', filename);
    if (existsSync(savedPath)) unlinkSync(savedPath);
  });

  it('should return 400 if no file is uploaded', async () => {
    const response = await request(app.getHttpServer())
      .post('/files')
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('Файл не указан или недопустимый тип файла');
  });

  it('should reject file with invalid mime type', async () => {
    const testFilePath = join(__dirname, 'test-files', 'invalid.txt');

    const response = await request(app.getHttpServer())
      .post('/files')
      .attach('file', testFilePath)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('Файл не указан или недопустимый тип файла');
  });

  afterAll(async () => {
    await app.close();
  });
});
