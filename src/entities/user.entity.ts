import { Entity, Column } from 'typeorm';
import {
  IsEmail,
  IsString,
  IsDate,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

import { UserRole } from 'src/enums/roles.enum';

@Entity({
  name: 'users',
})
export class User {
  @Column({
    type: 'uuid',
    primary: true,
    nullable: false,
  })
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
    type: 'varchar',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  gender: string;

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
}
