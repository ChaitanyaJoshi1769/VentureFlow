import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class BillingService {
  private logger = new Logger('BillingService');

  constructor(private prisma: PrismaService) {}

  /**
   * Get billing overview
   */
  async getBillingOverview(organizationId: string) {
    try {
      const subscription = await this.prisma.stripeSubscription.findFirst({
        where: { organizationId },
      });

      const invoices = await this.prisma.invoice.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return {
        currentPlan: subscription?.plan || 'free',
        status: subscription?.status || 'inactive',
        billingCycle: {
          start: subscription?.currentPeriodStart,
          end: subscription?.currentPeriodEnd,
        },
        recentInvoices: invoices,
        totalSpent: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      };
    } catch (error) {
      this.logger.error(`Failed to get billing overview: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory(organizationId: string, page = 1, pageSize = 10) {
    try {
      const skip = (page - 1) * pageSize;
      const invoices = await this.prisma.invoice.findMany({
        where: { organizationId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      const total = await this.prisma.invoice.count({
        where: { organizationId },
      });

      return {
        data: invoices,
        pagination: {
          page,
          pageSize,
          total,
          pages: Math.ceil(total / pageSize),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get billing history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(organizationId: string) {
    try {
      const users = await this.prisma.user.count({
        where: { organizationId },
      });

      const investors = await this.prisma.investor.count({
        where: { organizationId, deletedAt: null },
      });

      const startups = await this.prisma.startup.count({
        where: { organizationId, deletedAt: null },
      });

      const activities = await this.prisma.activity.count({
        where: { organizationId },
      });

      const subscription = await this.prisma.stripeSubscription.findFirst({
        where: { organizationId },
      });

      const planLimits = this.getPlanLimits(subscription?.plan || 'free');

      return {
        users: {
          current: users,
          limit: planLimits.users,
          percentage: Math.round((users / planLimits.users) * 100),
        },
        investors: {
          current: investors,
          limit: planLimits.investors,
          percentage: Math.round((investors / planLimits.investors) * 100),
        },
        startups: {
          current: startups,
          limit: planLimits.startups,
          percentage: Math.round((startups / planLimits.startups) * 100),
        },
        monthlyActivities: activities,
      };
    } catch (error) {
      this.logger.error(`Failed to get usage metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Estimate annual cost
   */
  async estimateAnnualCost(organizationId: string) {
    try {
      const subscription = await this.prisma.stripeSubscription.findFirst({
        where: { organizationId },
      });

      const plan = subscription?.plan || 'free';
      const pricing = this.getPlanPricing(plan);

      return {
        plan,
        monthlyPrice: pricing.monthly,
        annualPrice: pricing.monthly * 12,
        savings: pricing.monthly * 2, // 2 months savings annually
        nextBillingDate: subscription?.currentPeriodEnd,
      };
    } catch (error) {
      this.logger.error(`Failed to estimate cost: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available plans
   */
  getAvailablePlans() {
    return {
      plans: [
        {
          name: 'Starter',
          price: 29,
          billingPeriod: 'monthly',
          features: [
            'Up to 100 investors',
            'Basic CRM',
            'Email campaigns',
            '1 team member',
            'Community support',
          ],
          ideal: 'Small teams just getting started',
        },
        {
          name: 'Professional',
          price: 99,
          billingPeriod: 'monthly',
          features: [
            'Up to 1000 investors',
            'Advanced CRM + AI matching',
            'Unlimited campaigns',
            'Up to 5 team members',
            'Priority support',
            'Custom integrations',
          ],
          ideal: 'Growing startups and teams',
          popular: true,
        },
        {
          name: 'Enterprise',
          price: 299,
          billingPeriod: 'monthly',
          features: [
            'Unlimited investors',
            'Full platform access',
            'Dedicated account manager',
            'Unlimited team members',
            'Custom integrations',
            '24/7 premium support',
            'SLA guarantee',
          ],
          ideal: 'Large organizations with advanced needs',
        },
      ],
    };
  }

  private getPlanLimits(plan: string): { users: number; investors: number; startups: number } {
    const limits = {
      free: { users: 1, investors: 100, startups: 5 },
      starter: { users: 2, investors: 100, startups: 10 },
      professional: { users: 5, investors: 1000, startups: 50 },
      enterprise: { users: 999, investors: 999999, startups: 999999 },
    };

    return limits[plan] || limits['free'];
  }

  private getPlanPricing(plan: string): { monthly: number } {
    const pricing = {
      free: { monthly: 0 },
      starter: { monthly: 29 },
      professional: { monthly: 99 },
      enterprise: { monthly: 299 },
    };

    return pricing[plan] || pricing['free'];
  }
}
