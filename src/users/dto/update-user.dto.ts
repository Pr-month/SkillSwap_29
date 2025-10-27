import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@/enums/gender.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'Иван Петров' })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Коротко о себе' })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  birthdate?: string;

  @ApiPropertyOptional({ example: 'Москва' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
