import { CreateSkillDto } from './create-skill.dto';
import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  category?: string; 

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}