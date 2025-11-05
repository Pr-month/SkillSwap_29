import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

// Swagger конфигурация
const swaggerConfig = new DocumentBuilder()
  .setTitle('SkillSwap API')
  .setDescription(
    'Документация API SkillSwap.\n\nТестовый пользователь для быстрого входа:\n- email: ivan@example.com\n- password: user123\n\nШаги: выполните POST /auth/login -> скопируйте accessToken -> нажмите Authorize и вставьте Bearer <token>.',
  )
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Авторизация',
    description: 'Введите JWT access token',
    in: 'header',
  })
  .addSecurityRequirements('Bearer')
  .build();

const swaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: 'SkillSwap API Docs',
  //   customJs: '/public/swagger-auth.js',
};

export const configureSwagger = (app: INestApplication<any>) => {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, swaggerOptions);
};
