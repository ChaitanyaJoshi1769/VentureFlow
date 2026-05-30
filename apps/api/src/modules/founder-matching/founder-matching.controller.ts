import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FounderMatchingService } from './founder-matching.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/ai/founder-matching')
@UseGuards(JwtGuard)
export class FounderMatchingController {
  constructor(private founderMatchingService: FounderMatchingService) {}

  @Get('advisors/:startupId')
  async matchAdvisors(@Request() req: any, @Param('startupId') startupId: string) {
    return this.founderMatchingService.matchWithAdvisors(req.user.organizationId, startupId);
  }

  @Post('cofounders/:startupId')
  async matchCoFounders(
    @Request() req: any,
    @Param('startupId') startupId: string,
    @Body() founderProfile: any,
  ) {
    return this.founderMatchingService.matchCoFounders(
      req.user.organizationId,
      startupId,
      founderProfile,
    );
  }

  @Get('assessment/:startupId')
  async assessFounderMarketFit(@Request() req: any, @Param('startupId') startupId: string) {
    return this.founderMatchingService.assessFounderMarketFit(req.user.organizationId, startupId);
  }

  @Get('resources/:startupId')
  async getResources(@Param('startupId') startupId: string) {
    return this.founderMatchingService.getFounderResources(startupId);
  }
}
