import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { SkillsModule } from '@/skills/skills.module';
import { CategoriesModule } from '@/categories/categories.module';
import { RequestsModule } from '@/requests/requests.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IDbConfig, IJwtConfig } from '@/config/types';
import { appConfig } from '@/config/app.config';
import { jwtConfig } from '@/config/jwt.config';
import { dbConfig } from '@/config/db.config';
import { fileConfig } from '@/config/file.config';
import { wsConfig } from './config/ws.config';
import { FilesModule } from '@/files/files.module';
import { NotificationsGateway } from '@/notifications/notifications.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, dbConfig, fileConfig, wsConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [jwtConfig.KEY],
      useFactory: (cfg: IJwtConfig) => ({
        secret: cfg.accessSecret,
        signOptions: {
          expiresIn: cfg.accessExpiresIn as JwtSignOptions['expiresIn'],
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (cfg: IDbConfig) => cfg,
    }),
    UsersModule,
    AuthModule,
    SkillsModule,
    CategoriesModule,
    FilesModule,
    RequestsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule {}
