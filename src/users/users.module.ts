import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { Skill } from '@/entities/skill.entity';
import { SkillsService } from '@/skills/skills.service';
import { CategoriesService } from '@/categories/categories.service';
import { Category } from '@/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Skill, Category])],
  controllers: [UsersController],
  providers: [UsersService, SkillsService, CategoriesService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
