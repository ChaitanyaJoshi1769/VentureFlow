import { Module } from '@nestjs/common';
import { StartupProfilesService } from './startup-profiles.service';
import { StartupProfilesController } from './startup-profiles.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [StartupProfilesController],
  providers: [StartupProfilesService, PrismaService],
  exports: [StartupProfilesService],
})
export class StartupProfilesModule {}
