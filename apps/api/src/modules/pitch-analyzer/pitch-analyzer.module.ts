import { Module } from '@nestjs/common';
import { PitchAnalyzerService } from './pitch-analyzer.service';
import { PitchAnalyzerController } from './pitch-analyzer.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [PitchAnalyzerController],
  providers: [PitchAnalyzerService, PrismaService],
  exports: [PitchAnalyzerService],
})
export class PitchAnalyzerModule {}
