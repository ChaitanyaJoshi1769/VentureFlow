import { Module } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { InvestorsController } from './investors.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  imports: [],
  controllers: [InvestorsController],
  providers: [InvestorsService, PrismaService],
  exports: [InvestorsService],
})
export class InvestorsModule {}
