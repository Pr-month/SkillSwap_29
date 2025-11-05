import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { JwtWsGuard } from '@/guards/ws-jwt.guard';

@Module({
  imports: [JwtModule],
  providers: [NotificationsGateway, JwtWsGuard],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
