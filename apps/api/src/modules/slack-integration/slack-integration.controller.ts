import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SlackIntegrationService } from './slack-integration.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/integrations/slack')
@UseGuards(JwtGuard)
export class SlackIntegrationController {
  constructor(private slackService: SlackIntegrationService) {}

  @Post('configure')
  async configureWorkspace(
    @Request() req: any,
    @Body() { teamId, webhookUrl, channels }: any,
  ) {
    return this.slackService.configureSlackWorkspace(
      req.user.organizationId,
      teamId,
      webhookUrl,
      channels,
    );
  }

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.slackService.getSlackStatus(req.user.organizationId);
  }

  @Post('test')
  async testNotification(@Request() req: any, @Body() { message, channel }: any) {
    return this.slackService.sendNotification(
      req.user.organizationId,
      channel || 'general',
      message,
    );
  }
}
