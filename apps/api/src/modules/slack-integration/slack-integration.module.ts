import { Module } from '@nestjs/common';
import { SlackIntegrationService } from './slack-integration.service';
import { SlackIntegrationController } from './slack-integration.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [SlackIntegrationController],
  providers: [SlackIntegrationService, PrismaService],
  exports: [SlackIntegrationService],
})
export class SlackIntegrationModule {}
