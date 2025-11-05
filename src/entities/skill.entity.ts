import { User } from './user.entity';
import { Category } from './category.entity';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
@ApiExtraModels()
@Entity()
export class Skill {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор навыка',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'React',
    description: 'Название навыка',
    maxLength: 100,
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    example: 'Библиотека JavaScript для создания пользовательских интерфейсов',
    description: 'Подробное описание навыка',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.skills, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  category: Category;

  @ApiProperty({
    description: 'Массив URL изображений, связанных с навыком',
    type: [String],
    example: ['/images/skills/react.png'],
    default: [],
  })
  @Column('text', { array: true, default: [] })
  images: string[];

  @ApiProperty({
    description: 'Пользователь, создавший навык',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ApiProperty({
    description: 'Дата и время создания записи',
    example: '2023-01-01T12:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата и время последнего обновления записи',
    example: '2023-01-02T15:30:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
