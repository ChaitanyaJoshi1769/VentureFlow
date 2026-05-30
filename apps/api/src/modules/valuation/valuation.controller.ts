import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ValuationService } from './valuation.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/ai/valuation')
@UseGuards(JwtGuard)
export class ValuationController {
  constructor(private valuationService: ValuationService) {}

  @Get('estimate/:startupId')
  async estimateValuation(@Request() req: any, @Param('startupId') startupId: string) {
    return this.valuationService.estimateValuation(req.user.organizationId, startupId);
  }

  @Post('dilution')
  async calculateDilution(
    @Request() req: any,
    @Body() { startupId, fundingRound, investorEquity }: any,
  ) {
    return this.valuationService.calculateDilution(
      req.user.organizationId,
      startupId,
      fundingRound,
      investorEquity,
    );
  }
}
