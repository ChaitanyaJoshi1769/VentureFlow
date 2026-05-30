import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PitchAnalyzerService } from './pitch-analyzer.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/pitch-analyzer')
@UseGuards(JwtGuard)
export class PitchAnalyzerController {
  constructor(private pitchAnalyzerService: PitchAnalyzerService) {}

  @Get('decks/:deckId')
  async analyzeDeck(@Request() req: any, @Param('deckId') deckId: string) {
    return this.pitchAnalyzerService.analyzeDeck(req.user.organizationId, deckId);
  }

  @Post('decks/:deckId/detailed-feedback')
  async getDetailedFeedback(
    @Param('deckId') deckId: string,
    @Body() { aspect }: { aspect: string },
  ) {
    return this.pitchAnalyzerService.getDetailedFeedback(deckId, aspect);
  }

  @Post('decks/:deckId/investor-perspective')
  async getInvestorPerspective(
    @Param('deckId') deckId: string,
    @Body() investorProfile?: any,
  ) {
    return this.pitchAnalyzerService.getInvestorPerspective(deckId, investorProfile);
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  async compareDecks(
    @Body() { deckId1, deckId2 }: { deckId1: string; deckId2: string },
  ) {
    return this.pitchAnalyzerService.compareDecks(deckId1, deckId2);
  }
}
