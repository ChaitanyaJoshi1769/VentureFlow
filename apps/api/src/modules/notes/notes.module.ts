import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  providers: [NotesService, PrismaService],
  exports: [NotesService],
})
export class NotesModule {}
