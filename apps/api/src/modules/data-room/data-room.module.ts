import { Module } from '@nestjs/common';
import { DataRoomService } from './data-room.service';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  providers: [DataRoomService, PrismaService],
  exports: [DataRoomService],
})
export class DataRoomModule {}
