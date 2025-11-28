import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '@/entities/request.entity';
import { UsersModule } from '@/users/users.module';
import { SkillsModule } from '@/skills/skills.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request]),
    UsersModule,
    SkillsModule,
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
