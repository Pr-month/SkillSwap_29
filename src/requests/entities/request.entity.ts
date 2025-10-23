import { User } from '../../entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { RequestStatus } from '../enums/request-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from 'typeorm';
import {
  IsUUID,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsNotEmptyObject,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

@Entity({ name: 'requests' })
@Index(['sender', 'receiver', 'offeredSkill', 'requestedSkill'], {
  unique: true,
})
export class Request {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  @IsOptional()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => User)
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => User)
  receiver: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  @IsEnum(RequestStatus, { message: 'Некорректный статус заявки' })
  status: RequestStatus;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offered_skill_id' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Skill)
  offeredSkill: Skill;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_skill_id' })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Skill)
  requestedSkill: Skill;

  @Column({ default: false })
  @IsBoolean()
  isRead: boolean;
}
