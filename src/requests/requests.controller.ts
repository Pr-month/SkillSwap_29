import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '../enums/request-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthRequest } from '../auth/types';
import { UserRole } from '../enums/roles.enum';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Создание заявки
  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @Req() req: AuthRequest) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }
  // Получение входящих заявок
  @Get('incoming')
  findIncoming(@Req() req: AuthRequest) {
    return this.requestsService.findIncomingRequests(req.user.sub);
  }
  // Получение исходящих заявок
  @Get('outgoing')
  findOutgoing(@Req() req: AuthRequest) {
    return this.requestsService.findOutgoingRequests(req.user.sub);
  }
  // Пометка заявки как прочитанная
  @Patch(':id/read')
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    return this.requestsService.markAsRead(id, req.user.sub);
  }
  // Принятие заявки
  @Patch(':id/accept')
  acceptRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.requestsService.updateStatus(
      id,
      RequestStatus.ACCEPTED,
      req.user.sub,
    );
  }
  // Отклонение заявки
  @Patch(':id/reject')
  rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.requestsService.updateStatus(
      id,
      RequestStatus.REJECTED,
      req.user.sub,
    );
  }
  // Удаление заявки
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(
      id,
      req.user.sub,
      req.user.role === UserRole.ADMIN,
    );
  }
}
