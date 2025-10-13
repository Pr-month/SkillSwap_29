import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty()
    name: string;

    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email обязателен' })
    email: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен' })
    @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
    password: string;
}