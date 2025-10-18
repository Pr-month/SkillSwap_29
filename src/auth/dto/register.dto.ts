import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsOptional,
    IsEnum,
    MaxLength,
    IsDateString,
} from 'class-validator';
import { Gender } from '../../enums/gender.enum';
import { UserRole } from '../../enums/roles.enum';

export class RegisterDto {
    @IsString({ message: 'Имя должно быть строкой' })
    @MinLength(2)
    @MaxLength(50)
    @IsNotEmpty()
    name: string;

    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен' })
    @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
    password: string;
    
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

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}