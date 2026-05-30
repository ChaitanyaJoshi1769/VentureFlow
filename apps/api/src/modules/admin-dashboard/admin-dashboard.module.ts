import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, PrismaService],
  exports: [AdminDashboardService],
})
export class AdminDashboardModule {}
