import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

// import { Skill } from './skill.entity';

import { Gender } from '../enums/gender.enum';
import { UserRole } from '../enums/roles.enum';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
  })
  @IsEmail()
  email: string;

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
  about: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  @IsDate()
  @IsOptional()
  birthdate: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  city: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.UNKNOWN,
    nullable: false,
  })
  gender: Gender;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  refreshToken: string;

  // @ManyToMany(() => Skill)
  // @JoinTable({ name: 'user_skills' })
  // skills: Skill[];

  // @ManyToMany(() => Skill)
  // @JoinTable({ name: 'user_want_to_learn' })
  // wantToLearn: Skill[];

  // @ManyToMany(() => Skill)
  // @JoinTable({ name: 'user_favorite_skills' })
  // favoriteSkills: Skill[];
}
