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
import { ApiTags } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from '@/enums/request-status.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthRequest } from '@/auth/types';
import { UserRole } from '@/enums/roles.enum';
import {
  ApiAcceptRequest,
  ApiCreateRequest,
  ApiDeleteRequest,
  ApiFindIncomingRequests,
  ApiFindOutgoingRequests,
  ApiMarkRequestAsRead,
  ApiRejectRequest,
} from './requests.swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Заявки')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiCreateRequest()
  create(@Body() createRequestDto: CreateRequestDto, @Req() req: AuthRequest) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }
  @Get('incoming')
  @ApiFindIncomingRequests()
  findIncoming(@Req() req: AuthRequest) {
    return this.requestsService.findIncomingRequests(req.user.sub);
  }
  @Get('outgoing')
  @ApiFindOutgoingRequests()
  findOutgoing(@Req() req: AuthRequest) {
    return this.requestsService.findOutgoingRequests(req.user.sub);
  }
  @Patch(':id/read')
  @ApiMarkRequestAsRead()
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    return this.requestsService.markAsRead(id, req.user.sub);
  }
  @Patch(':id/accept')
  @ApiAcceptRequest()
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
  @Patch(':id/reject')
  @ApiRejectRequest()
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
  @Delete(':id')
  @ApiDeleteRequest()
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    return this.requestsService.remove(
      id,
      req.user.sub,
      req.user.role === UserRole.ADMIN,
    );
  }
}
