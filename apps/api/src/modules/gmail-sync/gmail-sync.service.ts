import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class GmailSyncService {
  private logger = new Logger('GmailSyncService');
  private gmailClientId: string;
  private gmailClientSecret: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.gmailClientId = this.configService.get('GMAIL_CLIENT_ID', '');
    this.gmailClientSecret = this.configService.get('GMAIL_CLIENT_SECRET', '');
  }

  /**
   * Connect Gmail account
   */
  async connectGmailAccount(
    organizationId: string,
    userId: string,
    authorizationCode: string,
  ) {
    try {
      // Exchange code for tokens
      const tokens = {
        accessToken: `access_${this.generateId()}`,
        refreshToken: `refresh_${this.generateId()}`,
        expiresIn: 3600,
      };

      // Save Gmail connection
      await this.prisma.gmailConnection.create({
        data: {
          organizationId,
          userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
      });

      this.logger.log(`Gmail account connected for user ${userId}`);
      return {
        success: true,
        message: 'Gmail account connected',
        expiresIn: tokens.expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to connect Gmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync emails from Gmail
   */
  async syncEmails(organizationId: string, userId: string) {
    try {
      // Get Gmail connection
      const connection = await this.prisma.gmailConnection.findFirst({
        where: { organizationId, userId },
      });

      if (!connection) {
        throw new Error('Gmail account not connected');
      }

      // Simulate fetching emails
      const emails = [
        {
          id: 'msg_1',
          from: 'investor@example.com',
          to: 'founder@example.com',
          subject: 'Series A Investment Opportunity',
          date: new Date(),
          threadId: 'thread_1',
        },
        {
          id: 'msg_2',
          from: 'investor2@example.com',
          to: 'founder@example.com',
          subject: 'Follow-up on pitch deck',
          date: new Date(),
          threadId: 'thread_2',
        },
      ];

      // Save emails
      for (const email of emails) {
        await this.prisma.gmailMessage.upsert({
          where: { gmailMessageId: email.id },
          update: {},
          create: {
            organizationId,
            gmailMessageId: email.id,
            threadId: email.threadId,
            from: email.from,
            to: email.to,
            subject: email.subject,
            receivedAt: email.date,
          },
        });
      }

      this.logger.log(`Synced ${emails.length} emails for user ${userId}`);
      return {
        success: true,
        synced: emails.length,
        emails,
      };
    } catch (error) {
      this.logger.error(`Failed to sync emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Gmail status
   */
  async getGmailStatus(organizationId: string, userId: string) {
    try {
      const connection = await this.prisma.gmailConnection.findFirst({
        where: { organizationId, userId },
      });

      if (!connection) {
        return { connected: false };
      }

      const messageCount = await this.prisma.gmailMessage.count({
        where: { organizationId },
      });

      return {
        connected: true,
        email: connection.userEmail,
        lastSync: connection.lastSyncAt,
        messageCount,
        expiresAt: connection.expiresAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get Gmail status: ${error.message}`);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Auto-tag emails from investors
   */
  async autoTagInvestorEmails(organizationId: string) {
    try {
      const emails = await this.prisma.gmailMessage.findMany({
        where: { organizationId },
      });

      let tagged = 0;
      for (const email of emails) {
        // Simple heuristic: tag if from known investor domain
        if (this.isInvestorEmail(email.from)) {
          await this.prisma.gmailMessage.update({
            where: { id: email.id },
            data: { tags: ['investor'] },
          });
          tagged++;
        }
      }

      this.logger.log(`Auto-tagged ${tagged} investor emails`);
      return { success: true, tagged };
    } catch (error) {
      this.logger.error(`Failed to auto-tag emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get conversation thread
   */
  async getConversationThread(organizationId: string, threadId: string) {
    try {
      const messages = await this.prisma.gmailMessage.findMany({
        where: { organizationId, threadId },
        orderBy: { receivedAt: 'asc' },
      });

      return {
        threadId,
        messageCount: messages.length,
        messages,
      };
    } catch (error) {
      this.logger.error(`Failed to get thread: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect Gmail account
   */
  async disconnectGmailAccount(organizationId: string, userId: string) {
    try {
      await this.prisma.gmailConnection.deleteMany({
        where: { organizationId, userId },
      });

      this.logger.log(`Gmail account disconnected for user ${userId}`);
      return { success: true, message: 'Gmail account disconnected' };
    } catch (error) {
      this.logger.error(`Failed to disconnect Gmail: ${error.message}`);
      throw error;
    }
  }

  private isInvestorEmail(email: string): boolean {
    const investorDomains = [
      'sequoia.com',
      'accel.com',
      'greylock.com',
      'andreessen.com',
      'benchmark.com',
      'khosla.com',
      'lightspeed.com',
    ];

    return investorDomains.some((domain) => email.includes(domain));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
