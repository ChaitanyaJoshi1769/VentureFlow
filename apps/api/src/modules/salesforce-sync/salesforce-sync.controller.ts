import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SalesforceSyncService } from './salesforce-sync.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/integrations/salesforce')
@UseGuards(JwtGuard)
export class SalesforceSyncController {
  constructor(private sfService: SalesforceSyncService) {}

  @Post('connect')
  async connectSalesforce(
    @Request() req: any,
    @Body() { authorizationCode }: any,
  ) {
    return this.sfService.connectSalesforce(
      req.user.organizationId,
      req.user.id,
      authorizationCode,
    );
  }

  @Post('sync-investors')
  async syncInvestors(@Request() req: any) {
    return this.sfService.syncInvestorsToSalesforce(req.user.organizationId);
  }

  @Post('sync-opportunities')
  async syncStartups(@Request() req: any) {
    return this.sfService.syncStartupsToSalesforce(req.user.organizationId);
  }

  @Post('sync-activities')
  async syncActivities(@Request() req: any) {
    return this.sfService.syncActivitiesToSalesforce(req.user.organizationId);
  }

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.sfService.getSalesforceStatus(req.user.organizationId);
  }

  @Post('disconnect')
  async disconnectSalesforce(@Request() req: any) {
    return this.sfService.disconnectSalesforce(req.user.organizationId);
  }
}
