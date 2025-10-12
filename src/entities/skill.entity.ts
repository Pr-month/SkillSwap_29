import { IsUUID } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'skills' })
export class Skill {
  @Column({
    type: 'uuid',
    primary: true,
    nullable: false,
  })
  @IsUUID()
  id: string;
}
