import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AiMatchingService } from './ai-matching.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/matching')
@UseGuards(JwtGuard)
export class AiMatchingController {
  constructor(private aiMatchingService: AiMatchingService) {}

  @Get('investors/startup/:startupId')
  async findInvestorMatches(
    @Request() req: any,
    @Param('startupId') startupId: string,
  ) {
    return this.aiMatchingService.findInvestorMatches(
      req.user.organizationId,
      startupId,
      20,
    );
  }

  @Get('startups/investor/:investorId')
  async findStartupMatches(
    @Request() req: any,
    @Param('investorId') investorId: string,
  ) {
    return this.aiMatchingService.findStartupMatches(
      req.user.organizationId,
      investorId,
      20,
    );
  }

  @Get('insights/:startupId')
  async getInsights(@Request() req: any, @Param('startupId') startupId: string) {
    return this.aiMatchingService.getMatchInsights(
      req.user.organizationId,
      startupId,
    );
  }

  @Post('quality')
  async getMatchQuality(
    @Request() req: any,
    @Body() { investorId, startupId }: { investorId: string; startupId: string },
  ) {
    return this.aiMatchingService.getMatchQuality(
      req.user.organizationId,
      investorId,
      startupId,
    );
  }

  @Post('batch')
  async batchMatch(
    @Request() req: any,
    @Body() { startupIds }: { startupIds: string[] },
  ) {
    return this.aiMatchingService.batchMatchStartups(
      req.user.organizationId,
      startupIds,
    );
  }
}
