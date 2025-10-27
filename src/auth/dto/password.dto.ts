import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordDto {
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  currentPassword: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  newPassword: string;
}