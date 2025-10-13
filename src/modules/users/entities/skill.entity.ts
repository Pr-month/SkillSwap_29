import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'skills' })
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;
}
