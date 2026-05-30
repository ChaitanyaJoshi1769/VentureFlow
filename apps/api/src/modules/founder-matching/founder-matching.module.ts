import { Module } from '@nestjs/common';
import { FounderMatchingService } from './founder-matching.service';
import { FounderMatchingController } from './founder-matching.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [FounderMatchingController],
  providers: [FounderMatchingService, PrismaService],
  exports: [FounderMatchingService],
})
export class FounderMatchingModule {}
