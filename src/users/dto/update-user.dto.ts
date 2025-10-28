import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Gender } from '../../enums/gender.enum';

export class UpdateUserDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  birthdate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;
}
