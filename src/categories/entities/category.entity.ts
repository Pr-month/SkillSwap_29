import { Skill } from '../../skills/entities/skill.entity';
import {  
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany,
  JoinColumn
} from 'typeorm';
import { 
  IsUUID, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional 
} from 'class-validator';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({
    type: 'varchar',
    nullable: false
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Column({
    type: 'uuid',
    nullable: true
  })
  @IsUUID()
  @IsOptional()
  parentId: string;

  @ManyToOne(() => Category, category => category.children, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Skill, skill => skill.category)
  skills: Skill[];
}