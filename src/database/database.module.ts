import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const dbUrl = await Promise.resolve(
          configService.get<string>('DB_ADDRESS'),
        );

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [],
          migrations: ['dist/migration/**/*{.js,.ts}'],
          synchronize: false,
          retryAttempts: 5, // Количество попыток переподключения
          retryDelay: 1000, // Задержка между попытками в миллисекундах
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
