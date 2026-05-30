import { Module } from '@nestjs/common';
import { ValuationService } from './valuation.service';
import { ValuationController } from './valuation.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [ValuationController],
  providers: [ValuationService, PrismaService],
  exports: [ValuationService],
})
export class ValuationModule {}
