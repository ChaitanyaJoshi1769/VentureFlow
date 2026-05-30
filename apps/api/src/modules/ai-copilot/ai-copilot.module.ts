import { Module } from '@nestjs/common';
import { AiCopilotService } from './ai-copilot.service';
import { AiCopilotController } from './ai-copilot.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [AiCopilotController],
  providers: [AiCopilotService, PrismaService],
  exports: [AiCopilotService],
})
export class AiCopilotModule {}
