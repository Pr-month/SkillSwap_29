import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsersQueryDto {
  @ApiProperty({
    description: 'Номер страницы',
    minimum: 1,
    default: 1,
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Количество записей на странице',
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
    example: 20,
  })
  @IsOptional()
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Type(() => Number)
  @Min(1, { message: 'Лимит должен быть не менее 1' })
  @Max(100, { message: 'Лимит не может превышать 100' })
  limit: number = 20;
}
