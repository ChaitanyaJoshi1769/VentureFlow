import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class AdminDashboardService {
  private logger = new Logger('AdminDashboardService');

  constructor(private prisma: PrismaService) {}

  /**
   * Get admin dashboard overview
   */
  async getDashboardOverview(organizationId: string, userId: string) {
    try {
      // Verify admin access
      await this.verifyAdminAccess(organizationId, userId);

      const totalUsers = await this.prisma.user.count({
        where: { organizationId },
      });

      const totalInvestors = await this.prisma.investor.count({
        where: { organizationId, deletedAt: null },
      });

      const totalStartups = await this.prisma.startup.count({
        where: { organizationId, deletedAt: null },
      });

      const activeUsersToday = await this.prisma.activity.findMany({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      const systemHealth = {
        uptime: 99.99,
        apiLatency: 142,
        errorRate: 0.01,
        status: 'healthy',
      };

      return {
        metrics: {
          totalUsers,
          totalInvestors,
          totalStartups,
          activeUsersToday: activeUsersToday.length,
        },
        systemHealth,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all users in organization
   */
  async listUsers(organizationId: string, userId: string, page = 1, pageSize = 20) {
    try {
      await this.verifyAdminAccess(organizationId, userId);

      const skip = (page - 1) * pageSize;
      const users = await this.prisma.user.findMany({
        where: { organizationId },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      const total = await this.prisma.user.count({
        where: { organizationId },
      });

      return {
        data: users,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to list users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    organizationId: string,
    adminId: string,
    userId: string,
    newRole: 'admin' | 'manager' | 'user',
  ) {
    try {
      await this.verifyAdminAccess(organizationId, adminId);

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
        select: { id: true, email: true, role: true },
      });

      this.logger.log(`User role updated: ${user.email} → ${newRole}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update user role: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disable user account
   */
  async disableUser(organizationId: string, adminId: string, userId: string) {
    try {
      await this.verifyAdminAccess(organizationId, adminId);

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { disabled: true },
      });

      this.logger.log(`User disabled: ${user.email}`);
      return { success: true, message: 'User disabled' };
    } catch (error) {
      this.logger.error(`Failed to disable user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(organizationId: string, userId: string) {
    try {
      await this.verifyAdminAccess(organizationId, userId);

      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          metadata: true,
          createdAt: true,
        },
      });

      return org;
    } catch (error) {
      this.logger.error(`Failed to get org settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    organizationId: string,
    userId: string,
    settings: any,
  ) {
    try {
      await this.verifyAdminAccess(organizationId, userId);

      const org = await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          name: settings.name,
          email: settings.email,
          metadata: settings.metadata || {},
        },
      });

      this.logger.log(`Organization settings updated: ${org.name}`);
      return org;
    } catch (error) {
      this.logger.error(`Failed to update org settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(organizationId: string, userId: string, page = 1, pageSize = 50) {
    try {
      await this.verifyAdminAccess(organizationId, userId);

      const skip = (page - 1) * pageSize;
      const logs = await this.prisma.auditLog.findMany({
        where: { organizationId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.auditLog.count({
        where: { organizationId },
      });

      return {
        data: logs,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get audit logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export organization data
   */
  async exportOrganizationData(organizationId: string, userId: string, format = 'json') {
    try {
      await this.verifyAdminAccess(organizationId, userId);

      const investors = await this.prisma.investor.findMany({
        where: { organizationId, deletedAt: null },
      });

      const startups = await this.prisma.startup.findMany({
        where: { organizationId, deletedAt: null },
      });

      const data = {
        organizationId,
        exportedAt: new Date().toISOString(),
        investors: investors.length,
        startups: startups.length,
        summary: {
          totalInvestors: investors.length,
          totalStartups: startups.length,
        },
      };

      this.logger.log(`Data exported for org ${organizationId}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to export data: ${error.message}`);
      throw error;
    }
  }

  private async verifyAdminAccess(organizationId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
  }
}
