import { Module } from '@nestjs/common';
import { EmailAssistantService } from './email-assistant.service';
import { EmailAssistantController } from './email-assistant.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [EmailAssistantController],
  providers: [EmailAssistantService, PrismaService],
  exports: [EmailAssistantService],
})
export class EmailAssistantModule {}
