import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import {
  IsEmail,
  IsString,
  IsDate,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

import { Skill } from './skill.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ nullable: false })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ nullable: false })
  @IsString()
  @MinLength(6)
  password: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  about: string;

  @Column('date', { nullable: true })
  @IsDate()
  @IsOptional()
  birthdate: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  city: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  gender: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'ADMIN'],
    default: 'USER',
    nullable: false,
  })
  role: 'USER' | 'ADMIN';

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  refreshToken: string;

  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_skills' })
  skills: Skill[];

  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_want_to_learn' })
  wantToLearn: Skill[];

  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_favorite_skills' })
  favoriteSkills: Skill[];
}
