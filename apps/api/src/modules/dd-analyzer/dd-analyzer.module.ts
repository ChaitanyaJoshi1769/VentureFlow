import { Module } from '@nestjs/common';
import { DdAnalyzerService } from './dd-analyzer.service';
import { DdAnalyzerController } from './dd-analyzer.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [DdAnalyzerController],
  providers: [DdAnalyzerService, PrismaService],
  exports: [DdAnalyzerService],
})
export class DdAnalyzerModule {}
