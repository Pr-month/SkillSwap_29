import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images: string[] = [];
}
