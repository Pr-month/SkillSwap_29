import { Skill } from './skill.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  IsUUID,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId: string;

  @ApiProperty({
    description: 'Родительская категория',
    type: () => Category,
    required: false,
  })
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @ApiProperty({
    description: 'Дочерние категории',
    type: () => [Category],
    required: false,
  })
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ApiProperty({
    description: 'Навыки в этой категории',
    type: () => [Skill],
    required: false,
  })
  @OneToMany(() => Skill, (skill) => skill.category)
  skills: Skill[];
}
