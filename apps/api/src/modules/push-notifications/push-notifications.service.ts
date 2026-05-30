import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class PushNotificationsService {
  private logger = new Logger('PushNotificationsService');

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Register device for push notifications
   */
  async registerDevice(
    userId: string,
    deviceToken: string,
    deviceType: 'ios' | 'android' | 'web',
  ) {
    try {
      await this.prisma.pushDevice.upsert({
        where: { deviceToken },
        update: { lastActiveAt: new Date() },
        create: {
          userId,
          deviceToken,
          deviceType,
          isActive: true,
        },
      });

      this.logger.log(`Device registered: ${deviceType} for user ${userId}`);
      return { success: true, message: 'Device registered' };
    } catch (error) {
      this.logger.error(`Failed to register device: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const devices = await this.prisma.pushDevice.findMany({
        where: { userId, isActive: true },
      });

      const results = [];
      for (const device of devices) {
        const notification = {
          title,
          body,
          data,
          timestamp: new Date().toISOString(),
          deviceType: device.deviceType,
        };

        // Simulate sending push notification
        this.logger.log(`Push sent to ${device.deviceType}: ${title}`);
        results.push({
          deviceToken: device.deviceToken,
          status: 'sent',
        });
      }

      return { success: true, sent: results.length, results };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send batch push notifications
   */
  async sendBatchPushNotifications(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    try {
      const results = [];

      for (const userId of userIds) {
        const result = await this.sendPushNotification(userId, title, body, data);
        results.push({ userId, ...result });
      }

      return { success: true, totalSent: results.reduce((sum, r) => sum + r.sent, 0), results };
    } catch (error) {
      this.logger.error(`Failed to send batch notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify activity to user
   */
  async notifyActivity(
    userId: string,
    activityType: string,
    details: any,
  ) {
    const notificationTitles = {
      'investor_added': 'New Investor',
      'meeting_scheduled': 'Meeting Scheduled',
      'deal_closed': '🎉 Deal Closed!',
      'pitch_viewed': 'Pitch Deck Viewed',
    };

    const title = notificationTitles[activityType] || 'Activity Update';
    const body = this.buildActivityMessage(activityType, details);

    return this.sendPushNotification(userId, title, body, {
      type: activityType,
      ...details,
    });
  }

  /**
   * Notify organization team
   */
  async notifyOrganizationTeam(
    organizationId: string,
    title: string,
    body: string,
    excludeUserId?: string,
  ) {
    try {
      const teamMembers = await this.prisma.user.findMany({
        where: {
          organizationId,
          id: { not: excludeUserId },
        },
        select: { id: true },
      });

      const userIds = teamMembers.map((m) => m.id);
      return this.sendBatchPushNotifications(userIds, title, body);
    } catch (error) {
      this.logger.error(`Failed to notify team: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get push notification history
   */
  async getNotificationHistory(userId: string, limit = 20) {
    try {
      const notifications = await this.prisma.pushNotification.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get notification history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(deviceToken: string) {
    try {
      await this.prisma.pushDevice.update({
        where: { deviceToken },
        data: { isActive: false },
      });

      this.logger.log(`Device unregistered: ${deviceToken}`);
      return { success: true, message: 'Device unregistered' };
    } catch (error) {
      this.logger.error(`Failed to unregister device: ${error.message}`);
      throw error;
    }
  }

  private buildActivityMessage(activityType: string, details: any): string {
    const messages = {
      'investor_added': `${details.investorName || 'New investor'} added to your list`,
      'meeting_scheduled': `Meeting scheduled with ${details.investorName || 'investor'}`,
      'deal_closed': `Congratulations! Deal closed for ${details.startupName || 'startup'}`,
      'pitch_viewed': `${details.investorName || 'Investor'} viewed your pitch deck`,
    };

    return messages[activityType] || 'You have a new activity';
  }
}
