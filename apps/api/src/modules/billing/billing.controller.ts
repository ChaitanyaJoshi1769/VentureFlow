import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/billing')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('overview')
  async getBillingOverview(@Request() req: any) {
    return this.billingService.getBillingOverview(req.user.organizationId);
  }

  @Get('history')
  async getBillingHistory(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.billingService.getBillingHistory(req.user.organizationId, page, pageSize);
  }

  @Get('usage')
  async getUsageMetrics(@Request() req: any) {
    return this.billingService.getUsageMetrics(req.user.organizationId);
  }

  @Get('estimate')
  async estimateAnnualCost(@Request() req: any) {
    return this.billingService.estimateAnnualCost(req.user.organizationId);
  }

  @Get('plans')
  getAvailablePlans() {
    return this.billingService.getAvailablePlans();
  }
}
