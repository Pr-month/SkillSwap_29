import { IsUUID } from 'class-validator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;
}
