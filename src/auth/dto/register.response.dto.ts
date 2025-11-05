import { User } from '@/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Данные пользователя',
    type: User,
  })
  user: User;
}
