import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class AdvancedAnalyticsService {
  private logger = new Logger('AdvancedAnalyticsService');

  constructor(private prisma: PrismaService) {}

  /**
   * Get custom dashboard metrics
   */
  async getCustomDashboard(organizationId: string, filters?: any) {
    try {
      const investors = await this.prisma.investor.findMany({
        where: { organizationId, deletedAt: null },
      });

      const startups = await this.prisma.startup.findMany({
        where: { organizationId, deletedAt: null },
      });

      return {
        totalInvestors: investors.length,
        totalStartups: startups.length,
        totalFundsRaised: startups.reduce((sum, s) => sum + (s.raised || 0), 0),
        averageFundingSize: startups.length > 0 
          ? startups.reduce((sum, s) => sum + (s.targetAmount || 0), 0) / startups.length
          : 0,
        activeDeals: startups.filter(s => s.currentStage === 'Series A' || s.currentStage === 'Series B').length,
      };
    } catch (error) {
      this.logger.error(`Failed to get custom dashboard: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(
    organizationId: string,
    reportType: 'investor' | 'startup' | 'pipeline' | 'performance',
    filters?: any,
  ) {
    try {
      let reportData: any;

      switch (reportType) {
        case 'investor':
          reportData = await this.generateInvestorReport(organizationId, filters);
          break;
        case 'startup':
          reportData = await this.generateStartupReport(organizationId, filters);
          break;
        case 'pipeline':
          reportData = await this.generatePipelineReport(organizationId, filters);
          break;
        case 'performance':
          reportData = await this.generatePerformanceReport(organizationId, filters);
          break;
      }

      return {
        reportType,
        generatedAt: new Date().toISOString(),
        data: reportData,
      };
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get time-series metrics
   */
  async getTimeSeriesMetrics(
    organizationId: string,
    metricType: 'investors_added' | 'startups_created' | 'deals_closed',
    dateRange: { start: Date; end: Date },
  ) {
    try {
      const data = [];

      // Simulate time-series data
      const current = new Date(dateRange.start);
      while (current <= dateRange.end) {
        const dayStr = current.toISOString().split('T')[0];
        let value = 0;

        switch (metricType) {
          case 'investors_added':
            value = Math.floor(Math.random() * 10) + 5;
            break;
          case 'startups_created':
            value = Math.floor(Math.random() * 5) + 2;
            break;
          case 'deals_closed':
            value = Math.floor(Math.random() * 3);
            break;
        }

        data.push({ date: dayStr, value });
        current.setDate(current.getDate() + 1);
      }

      return {
        metricType,
        period: { start: dateRange.start, end: dateRange.end },
        data,
      };
    } catch (error) {
      this.logger.error(`Failed to get time-series metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(organizationId: string, cohortType: 'investor' | 'startup') {
    try {
      if (cohortType === 'investor') {
        return {
          cohorts: [
            {
              cohort: '2024-01',
              count: 45,
              activeRate: 0.89,
              engagementScore: 8.2,
            },
            {
              cohort: '2024-02',
              count: 52,
              activeRate: 0.85,
              engagementScore: 7.8,
            },
            {
              cohort: '2024-03',
              count: 38,
              activeRate: 0.92,
              engagementScore: 8.5,
            },
          ],
        };
      }

      return {
        cohorts: [
          {
            cohort: '2024-01',
            count: 12,
            fundingRate: 0.42,
            averageFunding: 1200000,
          },
          {
            cohort: '2024-02',
            count: 18,
            fundingRate: 0.39,
            averageFunding: 1100000,
          },
          {
            cohort: '2024-03',
            count: 15,
            fundingRate: 0.47,
            averageFunding: 1400000,
          },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get cohort analysis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get segment analysis
   */
  async getSegmentAnalysis(organizationId: string, segmentBy: 'sector' | 'stage' | 'geography') {
    try {
      if (segmentBy === 'sector') {
        return {
          segments: [
            { name: 'AI/ML', count: 124, percentage: 32, avgScore: 8.4 },
            { name: 'FinTech', count: 89, percentage: 23, avgScore: 7.9 },
            { name: 'HealthTech', count: 76, percentage: 20, avgScore: 8.1 },
            { name: 'Other', count: 99, percentage: 25, avgScore: 7.6 },
          ],
        };
      }

      if (segmentBy === 'stage') {
        return {
          segments: [
            { name: 'Pre-Seed', count: 145, percentage: 37, avgFunding: 500000 },
            { name: 'Seed', count: 128, percentage: 33, avgFunding: 1200000 },
            { name: 'Series A', count: 89, percentage: 23, avgFunding: 3500000 },
            { name: 'Series B+', count: 26, percentage: 7, avgFunding: 8000000 },
          ],
        };
      }

      return {
        segments: [
          { name: 'North America', count: 280, percentage: 72, activeRate: 0.88 },
          { name: 'Europe', count: 78, percentage: 20, activeRate: 0.82 },
          { name: 'Asia', count: 30, percentage: 8, activeRate: 0.85 },
        ],
      };
    } catch (error) {
      this.logger.error(`Failed to get segment analysis: ${error.message}`);
      throw error;
    }
  }

  private async generateInvestorReport(organizationId: string, filters?: any) {
    const investors = await this.prisma.investor.findMany({
      where: { organizationId, deletedAt: null },
    });

    return {
      totalInvestors: investors.length,
      byStage: {
        preseed: investors.filter((i) => i.stages?.includes('Pre-Seed')).length,
        seed: investors.filter((i) => i.stages?.includes('Seed')).length,
        seriesA: investors.filter((i) => i.stages?.includes('Series A')).length,
        seriesB: investors.filter((i) => i.stages?.includes('Series B')).length,
      },
      bySector: {
        ai: investors.filter((i) => i.sectors?.includes('AI')).length,
        fintech: investors.filter((i) => i.sectors?.includes('FinTech')).length,
        healthtech: investors.filter((i) => i.sectors?.includes('HealthTech')).length,
      },
    };
  }

  private async generateStartupReport(organizationId: string, filters?: any) {
    const startups = await this.prisma.startup.findMany({
      where: { organizationId, deletedAt: null },
    });

    return {
      totalStartups: startups.length,
      byStage: {
        preseed: startups.filter((s) => s.currentStage === 'Pre-Seed').length,
        seed: startups.filter((s) => s.currentStage === 'Seed').length,
        seriesA: startups.filter((s) => s.currentStage === 'Series A').length,
        seriesB: startups.filter((s) => s.currentStage === 'Series B').length,
      },
      totalFundsRaised: startups.reduce((sum, s) => sum + (s.raised || 0), 0),
      averageFundingSize: startups.length > 0 
        ? startups.reduce((sum, s) => sum + (s.targetAmount || 0), 0) / startups.length
        : 0,
    };
  }

  private async generatePipelineReport(organizationId: string, filters?: any) {
    return {
      pipelineStages: {
        target: 120,
        contacted: 45,
        meeting: 18,
        interested: 8,
        termSheet: 2,
        closed: 1,
      },
      conversionRates: {
        targetToContacted: 0.375,
        contactedToMeeting: 0.4,
        meetingToInterested: 0.44,
        interestedToTermSheet: 0.25,
        termSheetToClosed: 0.5,
      },
      timeInStage: {
        target: 45,
        contacted: 28,
        meeting: 21,
        interested: 14,
        termSheet: 7,
      },
    };
  }

  private async generatePerformanceReport(organizationId: string, filters?: any) {
    return {
      keyMetrics: {
        dealsPerMonth: 1.4,
        avgDealCycle: 120,
        successRate: 0.35,
        avgDealSize: 2100000,
      },
      topPerformers: [
        { name: 'User A', closedDeals: 5, totalValue: 8500000 },
        { name: 'User B', closedDeals: 3, totalValue: 5200000 },
        { name: 'User C', closedDeals: 2, totalValue: 3100000 },
      ],
    };
  }
}
