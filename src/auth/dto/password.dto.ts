import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description:
      'Новый пароль. Должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы',
    minLength: 8,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message:
      'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы (!@#$%^&*)',
  })
  newPassword: string;
}
