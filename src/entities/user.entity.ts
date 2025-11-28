import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Exclude } from 'class-transformer';
import { UUID } from 'crypto';
import { Skill } from './skill.entity';
import { Gender } from '@/enums/gender.enum';
import { UserRole } from '@/enums/roles.enum';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { Category } from './category.entity';

@ApiExtraModels()
@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор пользователя',
  })
  id: UUID;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    minLength: 2,
    maxLength: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    format: 'email',
  })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Люблю программировать и путешествовать',
    description: 'Информация о пользователе',
    required: false,
  })
  about: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  @ApiProperty({
    example: '1990-01-01',
    description: 'Дата рождения пользователя',
    required: false,
  })
  birthdate: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Москва',
    description: 'Город проживания',
    required: false,
  })
  city: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
    nullable: false,
  })
  @ApiProperty({
    enum: Gender,
    enumName: 'Gender',
    example: Gender.MALE,
    description: 'Пол пользователя',
  })
  gender: Gender;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '/uploads/avatars/avatar.jpg',
    description: 'URL аватара пользователя',
    required: false,
  })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Роль пользователя в системе',
  })
  role: UserRole;

  @Exclude()
  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  refreshToken: string;

  @ApiProperty({
    type: () => [Skill],
    description: 'Навыки, которыми владеет пользователь',
    isArray: true,
  })
  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_skills' })
  skills: Skill[];

  @ApiProperty({
    type: () => [Category],
    description: 'Навыки, которые пользователь хочет изучить',
    isArray: true,
    required: false,
  })
  @ManyToMany(() => Category)
  @JoinTable({ name: 'user_want_to_learn' })
  wantToLearn?: Category[];

  @ApiProperty({
    type: () => [Skill],
    description: 'Избранные навыки пользователя',
    isArray: true,
    required: false,
  })
  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_favorite_skills' })
  favoriteSkills?: Skill[];
}
