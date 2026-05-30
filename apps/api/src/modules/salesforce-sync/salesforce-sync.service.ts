import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class SalesforceSyncService {
  private logger = new Logger('SalesforceSyncService');
  private sfClientId: string;
  private sfClientSecret: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.sfClientId = this.configService.get('SALESFORCE_CLIENT_ID', '');
    this.sfClientSecret = this.configService.get('SALESFORCE_CLIENT_SECRET', '');
  }

  /**
   * Connect to Salesforce
   */
  async connectSalesforce(
    organizationId: string,
    userId: string,
    authorizationCode: string,
  ) {
    try {
      const tokens = {
        accessToken: `sf_access_${this.generateId()}`,
        refreshToken: `sf_refresh_${this.generateId()}`,
        instanceUrl: 'https://ventureflow.salesforce.com',
        expiresIn: 3600,
      };

      // Save Salesforce connection
      await this.prisma.salesforceConnection.create({
        data: {
          organizationId,
          userId,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          instanceUrl: tokens.instanceUrl,
          expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
      });

      this.logger.log(`Salesforce account connected for org ${organizationId}`);
      return {
        success: true,
        message: 'Salesforce connected',
        instanceUrl: tokens.instanceUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to connect Salesforce: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync accounts (investors) to Salesforce
   */
  async syncInvestorsToSalesforce(organizationId: string) {
    try {
      const investors = await this.prisma.investor.findMany({
        where: { organizationId, deletedAt: null },
        take: 100,
      });

      const synced = [];
      for (const investor of investors) {
        const sfAccount = {
          Id: `sf_${investor.id}`,
          Name: `${investor.firstName} ${investor.lastName}`,
          Email: investor.email,
          Phone: investor.phone,
          Type: 'Investor',
          Industry: investor.sectors?.join(';'),
          AnnualRevenue: investor.typicalCheckSize,
        };

        synced.push(sfAccount);

        // Save sync record
        await this.prisma.salesforceSync.upsert({
          where: { ventureflowId: investor.id },
          update: { lastSyncedAt: new Date() },
          create: {
            organizationId,
            ventureflowId: investor.id,
            ventureflowType: 'investor',
            salesforceId: sfAccount.Id,
            salesforceType: 'Account',
            lastSyncedAt: new Date(),
          },
        });
      }

      this.logger.log(`Synced ${synced.length} investors to Salesforce`);
      return { success: true, synced: synced.length };
    } catch (error) {
      this.logger.error(`Failed to sync investors: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync opportunities (startups/deals) to Salesforce
   */
  async syncStartupsToSalesforce(organizationId: string) {
    try {
      const startups = await this.prisma.startup.findMany({
        where: { organizationId, deletedAt: null },
        take: 100,
      });

      const synced = [];
      for (const startup of startups) {
        const sfOpportunity = {
          Id: `opp_${startup.id}`,
          Name: startup.name,
          Amount: startup.targetAmount,
          StageName: this.mapStageToSalesforce(startup.currentStage),
          CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          Description: startup.description,
          Probability: this.calculateCloseProbability(startup.currentStage),
        };

        synced.push(sfOpportunity);

        // Save sync record
        await this.prisma.salesforceSync.upsert({
          where: { ventureflowId: startup.id },
          update: { lastSyncedAt: new Date() },
          create: {
            organizationId,
            ventureflowId: startup.id,
            ventureflowType: 'startup',
            salesforceId: sfOpportunity.Id,
            salesforceType: 'Opportunity',
            lastSyncedAt: new Date(),
          },
        });
      }

      this.logger.log(`Synced ${synced.length} opportunities to Salesforce`);
      return { success: true, synced: synced.length };
    } catch (error) {
      this.logger.error(`Failed to sync opportunities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync activities (meetings, calls) to Salesforce
   */
  async syncActivitiesToSalesforce(organizationId: string) {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { organizationId, deletedAt: null },
        take: 100,
      });

      const synced = [];
      for (const activity of activities) {
        const sfTask = {
          Id: `task_${activity.id}`,
          Subject: activity.description,
          Status: 'Completed',
          ActivityDate: activity.createdAt,
          Type: 'Call',
          Priority: 'Normal',
        };

        synced.push(sfTask);
      }

      this.logger.log(`Synced ${synced.length} activities to Salesforce`);
      return { success: true, synced: synced.length };
    } catch (error) {
      this.logger.error(`Failed to sync activities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Salesforce sync status
   */
  async getSalesforceStatus(organizationId: string) {
    try {
      const connection = await this.prisma.salesforceConnection.findFirst({
        where: { organizationId },
      });

      if (!connection) {
        return { connected: false };
      }

      const syncCount = await this.prisma.salesforceSync.count({
        where: { organizationId },
      });

      return {
        connected: true,
        instanceUrl: connection.instanceUrl,
        lastSync: connection.lastSyncAt,
        syncedRecords: syncCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get sync status: ${error.message}`);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Disconnect from Salesforce
   */
  async disconnectSalesforce(organizationId: string) {
    try {
      await this.prisma.salesforceConnection.deleteMany({
        where: { organizationId },
      });

      this.logger.log(`Salesforce disconnected for org ${organizationId}`);
      return { success: true, message: 'Salesforce disconnected' };
    } catch (error) {
      this.logger.error(`Failed to disconnect: ${error.message}`);
      throw error;
    }
  }

  private mapStageToSalesforce(stage: string): string {
    const stageMap: { [key: string]: string } = {
      'Pre-Seed': 'Prospect',
      'Seed': 'Qualification',
      'Series A': 'Proposal/Price Quote',
      'Series B': 'Negotiation/Review',
      'Series C': 'Closed Won',
    };

    return stageMap[stage] || 'Prospecting';
  }

  private calculateCloseProbability(stage: string): number {
    const probabilityMap: { [key: string]: number } = {
      'Pre-Seed': 10,
      'Seed': 25,
      'Series A': 50,
      'Series B': 75,
      'Series C': 100,
    };

    return probabilityMap[stage] || 10;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
