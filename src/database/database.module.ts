import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Skill } from '../modules/users/entities/skill.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const dbConfig = await Promise.resolve({
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 5432,
          database: configService.get<string>('DB_NAME') || 'skillswap',
          username: configService.get<string>('DB_USER') || 'postgres',
          password: configService.get<string>('DB_PASSWORD') || 'postgres',
        });

        const isDevelopment =
          configService.get<string>('NODE_ENV') !== 'production';

        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          username: dbConfig.username,
          password: dbConfig.password,
          entities: [User, Skill],
          migrations: ['dist/migration/**/*{.js,.ts}'],
          synchronize: isDevelopment,
          retryAttempts: 5,
          retryDelay: 1000,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
