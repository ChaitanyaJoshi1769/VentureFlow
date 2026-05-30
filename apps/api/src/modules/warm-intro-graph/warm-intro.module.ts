import { Module } from '@nestjs/common';
import { WarmIntroService } from './warm-intro.service';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  providers: [WarmIntroService, PrismaService],
  exports: [WarmIntroService],
})
export class WarmIntroModule {}
