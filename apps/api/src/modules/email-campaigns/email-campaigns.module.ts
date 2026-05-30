import { Module } from '@nestjs/common';
import { EmailCampaignsService } from './email-campaigns.service';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  providers: [EmailCampaignsService, PrismaService],
  exports: [EmailCampaignsService],
})
export class EmailCampaignsModule {}
