import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { GmailSyncService } from './gmail-sync.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/integrations/gmail')
@UseGuards(JwtGuard)
export class GmailSyncController {
  constructor(private gmailService: GmailSyncService) {}

  @Post('connect')
  async connectGmailAccount(
    @Request() req: any,
    @Body() { authorizationCode }: any,
  ) {
    return this.gmailService.connectGmailAccount(
      req.user.organizationId,
      req.user.id,
      authorizationCode,
    );
  }

  @Post('sync')
  async syncEmails(@Request() req: any) {
    return this.gmailService.syncEmails(req.user.organizationId, req.user.id);
  }

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.gmailService.getGmailStatus(req.user.organizationId, req.user.id);
  }

  @Post('disconnect')
  async disconnectAccount(@Request() req: any) {
    return this.gmailService.disconnectGmailAccount(req.user.organizationId, req.user.id);
  }
}
