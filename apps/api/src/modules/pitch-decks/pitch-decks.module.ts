import { Module } from '@nestjs/common';
import { PitchDecksService } from './pitch-decks.service';
import { PitchDecksController, PitchDeckViewerController } from './pitch-decks.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  imports: [],
  controllers: [PitchDecksController, PitchDeckViewerController],
  providers: [PitchDecksService, PrismaService],
  exports: [PitchDecksService],
})
export class PitchDecksModule {}
