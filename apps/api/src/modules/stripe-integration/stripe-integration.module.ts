import { Module } from '@nestjs/common';
import { StripeIntegrationService } from './stripe-integration.service';
import { StripeIntegrationController } from './stripe-integration.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [StripeIntegrationController],
  providers: [StripeIntegrationService, PrismaService],
  exports: [StripeIntegrationService],
})
export class StripeIntegrationModule {}
