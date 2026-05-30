import { Module } from '@nestjs/common';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [AdvancedAnalyticsController],
  providers: [AdvancedAnalyticsService, PrismaService],
  exports: [AdvancedAnalyticsService],
})
export class AdvancedAnalyticsModule {}
