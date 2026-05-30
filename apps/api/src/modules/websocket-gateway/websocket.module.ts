import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  providers: [WebSocketGateway, PrismaService],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
