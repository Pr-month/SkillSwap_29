import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsUUID } from 'class-validator';

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;
}
