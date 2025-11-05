import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/entities/user.entity';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Access токен для аутентификации',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Данные зарегистрированного пользователя',
    type: () => User,
  })
  user: User;
}
