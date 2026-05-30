import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  imports: [],
  controllers: [CrmController],
  providers: [CrmService, PrismaService],
  exports: [CrmService],
})
export class CrmModule {}
