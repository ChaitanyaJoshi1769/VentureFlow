import { Module } from '@nestjs/common';
import { GmailSyncService } from './gmail-sync.service';
import { GmailSyncController } from './gmail-sync.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [GmailSyncController],
  providers: [GmailSyncService, PrismaService],
  exports: [GmailSyncService],
})
export class GmailSyncModule {}
