import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}