import { Module } from '@nestjs/common';
import { InvestorPortalService } from './investor-portal.service';
import { InvestorPortalController } from './investor-portal.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [InvestorPortalController],
  providers: [InvestorPortalService, PrismaService],
  exports: [InvestorPortalService],
})
export class InvestorPortalModule {}
