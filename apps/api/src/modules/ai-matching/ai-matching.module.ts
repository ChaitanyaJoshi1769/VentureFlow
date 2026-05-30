import { Module } from '@nestjs/common';
import { AiMatchingService } from './ai-matching.service';
import { AiMatchingController } from './ai-matching.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [AiMatchingController],
  providers: [AiMatchingService, PrismaService],
  exports: [AiMatchingService],
})
export class AiMatchingModule {}
