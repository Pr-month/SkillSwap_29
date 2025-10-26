import { RequestStatus } from '../../enums/request-status.enum';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  receiverId: string;

  @IsUUID()
  offeredSkillId: string;

  @IsUUID()
  requestedSkillId: string;

  @IsOptional()
  @IsEnum(RequestStatus, { message: 'Некорректный статус заявки' })
  status?: RequestStatus;

  @IsOptional()
  isRead?: boolean;
}
