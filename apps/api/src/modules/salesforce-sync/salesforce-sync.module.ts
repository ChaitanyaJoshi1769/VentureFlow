import { Module } from '@nestjs/common';
import { SalesforceSyncService } from './salesforce-sync.service';
import { SalesforceSyncController } from './salesforce-sync.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [SalesforceSyncController],
  providers: [SalesforceSyncService, PrismaService],
  exports: [SalesforceSyncService],
})
export class SalesforceSyncModule {}
