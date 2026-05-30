import { Module } from '@nestjs/common';
import { StartupsService } from './startups.service';
import { StartupsController } from './startups.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  imports: [],
  controllers: [StartupsController],
  providers: [StartupsService, PrismaService],
  exports: [StartupsService],
})
export class StartupsModule {}
