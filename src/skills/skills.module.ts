import { Category } from '@/entities/category.entity';
import { Skill } from '@/entities/skill.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Skill, Category, User])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule { }
