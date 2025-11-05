import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
