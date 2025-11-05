import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
  IsUrl,
  Matches,
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

  @ApiPropertyOptional({
    example: '2000-01-01',
    description: 'Дата рождения в формате YYYY-MM-DD',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Некорректный формат даты. Используйте формат YYYY-MM-DD' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Дата должна быть в формате YYYY-MM-DD',
  })
  birthdate?: string;

  @ApiPropertyOptional({ example: 'Москва' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'https://example.com/avatars/user123.jpg',
    description: 'URL аватара пользователя',
    format: 'url',
  })
  @IsOptional()
  @IsString()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    {
      message: 'Некорректный URL аватара. Должен начинаться с https://',
    },
  )
  avatar?: string;
}
