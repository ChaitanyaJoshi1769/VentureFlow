import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class SlackIntegrationService {
  private logger = new Logger('SlackIntegrationService');
  private slackWebhookUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.slackWebhookUrl = this.configService.get('SLACK_WEBHOOK_URL', '');
  }

  /**
   * Send notification to Slack
   */
  async sendNotification(
    organizationId: string,
    channel: string,
    message: string,
    details?: any,
  ): Promise<boolean> {
    try {
      if (!this.slackWebhookUrl) {
        this.logger.warn('Slack webhook URL not configured');
        return false;
      }

      const payload = this.buildSlackMessage(message, details);

      // Simulated Slack API call
      this.logger.log(`[SLACK] Sending to #${channel}: ${message}`);

      return true;
    } catch (error) {
      this.logger.error(`Slack notification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Send activity notification to Slack
   */
  async notifyActivity(
    organizationId: string,
    activityType: string,
    resourceId: string,
    description: string,
  ) {
    const channel = this.getChannelForActivity(activityType);
    return this.sendNotification(organizationId, channel, description, {
      activityType,
      resourceId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send investment milestone notification
   */
  async notifyInvestmentMilestone(
    organizationId: string,
    startupId: string,
    startupName: string,
    milestone: string,
    details: any,
  ) {
    const message = `🎉 Investment Update: ${startupName} - ${milestone}`;
    return this.sendNotification(organizationId, 'investments', message, {
      startupId,
      startupName,
      milestone,
      ...details,
    });
  }

  /**
   * Send pipeline update notification
   */
  async notifyPipelineUpdate(
    organizationId: string,
    investorId: string,
    investorName: string,
    fromStage: string,
    toStage: string,
  ) {
    const message = `📊 Pipeline Update: ${investorName} moved from ${fromStage} to ${toStage}`;
    return this.sendNotification(organizationId, 'pipeline', message, {
      investorId,
      investorName,
      fromStage,
      toStage,
    });
  }

  /**
   * Send alert notification
   */
  async sendAlert(
    organizationId: string,
    severity: 'critical' | 'warning' | 'info',
    title: string,
    description: string,
  ) {
    const emoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const message = `${emoji[severity]} ${title}: ${description}`;
    const channel = severity === 'critical' ? 'alerts' : 'notifications';

    return this.sendNotification(organizationId, channel, message, {
      severity,
      title,
      description,
    });
  }

  /**
   * Configure Slack workspace
   */
  async configureSlackWorkspace(
    organizationId: string,
    teamId: string,
    webhookUrl: string,
    channels: { [key: string]: string },
  ) {
    try {
      // Save Slack configuration to database
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          metadata: {
            slack: {
              teamId,
              webhookUrl,
              channels,
              connectedAt: new Date().toISOString(),
            },
          },
        },
      });

      this.logger.log(`Slack workspace configured for org ${organizationId}`);
      return { success: true, message: 'Slack workspace configured' };
    } catch (error) {
      this.logger.error(`Failed to configure Slack: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Slack connection status
   */
  async getSlackStatus(organizationId: string) {
    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { metadata: true },
      });

      const slackConfig = org?.metadata?.slack;
      return {
        connected: !!slackConfig?.teamId,
        teamId: slackConfig?.teamId,
        connectedAt: slackConfig?.connectedAt,
        channels: slackConfig?.channels || {},
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  private buildSlackMessage(title: string, details?: any) {
    return {
      text: title,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: title,
          },
        },
        ...(details
          ? [
              {
                type: 'section',
                fields: Object.entries(details).map(([key, value]) => ({
                  type: 'mrkdwn',
                  text: `*${key}*\n${JSON.stringify(value)}`,
                })),
              },
            ]
          : []),
      ],
    };
  }

  private getChannelForActivity(activityType: string): string {
    const channelMap: { [key: string]: string } = {
      'investor_added': 'investors',
      'startup_created': 'startups',
      'meeting_scheduled': 'meetings',
      'email_sent': 'campaigns',
      'document_shared': 'documents',
      'note_created': 'notes',
      'pipeline_update': 'pipeline',
      'deal_closed': 'investments',
    };

    return channelMap[activityType] || 'general';
  }
}
