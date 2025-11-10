import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { UsersModule } from '@/users/users.module';
import { Category } from '@/entities/category.entity';
import { Skill } from '@/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, Category]), UsersModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService, TypeOrmModule],
})
export class SkillsModule {}
