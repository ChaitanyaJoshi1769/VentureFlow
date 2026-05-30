import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class StartupProfilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get public startup profile
   */
  async getPublicProfile(startupId: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        logo: true,
        industry: true,
        tags: true,
        currentStage: true,
        targetAmount: true,
        raised: true,
        founderCount: true,
        teamSize: true,
        yearsInBusiness: true,
        visibility: true,
        createdAt: true,
        metrics: true,
        _count: {
          select: {
            pitchDecks: true,
            crmInvestors: true,
          },
        },
      },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    if (startup.visibility !== 'public' && startup.visibility !== 'anonymous') {
      throw new Error('This profile is private');
    }

    return this.formatProfileResponse(startup);
  }

  /**
   * Get full startup profile (authenticated)
   */
  async getFullProfile(organizationId: string, startupId: string) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
      include: {
        crmInvestors: {
          select: {
            id: true,
            investorId: true,
            stage: true,
            scoreOverall: true,
            lastContact: true,
          },
          take: 20,
        },
        pitchDecks: {
          select: {
            id: true,
            title: true,
            status: true,
            views: true,
            createdAt: true,
          },
          take: 5,
        },
      },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    return startup;
  }

  /**
   * Update startup profile
   */
  async updateProfile(
    organizationId: string,
    startupId: string,
    data: any,
  ) {
    return this.prisma.startup.update({
      where: { id: startupId },
      data: {
        ...data,
        organizationId,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Set profile visibility
   */
  async setVisibility(
    organizationId: string,
    startupId: string,
    visibility: 'public' | 'private' | 'anonymous',
  ) {
    return this.prisma.startup.update({
      where: { id: startupId },
      data: { visibility, updatedAt: new Date() },
    });
  }

  /**
   * Get startup metrics
   */
  async getMetrics(organizationId: string, startupId: string) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
      select: {
        id: true,
        metrics: true,
        raised: true,
        targetAmount: true,
        _count: {
          select: {
            crmInvestors: true,
            pitchDecks: true,
          },
        },
      },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    return {
      id: startup.id,
      raised: startup.raised,
      targetAmount: startup.targetAmount,
      fundingProgress: ((startup.raised || 0) / (startup.targetAmount || 1)) * 100,
      investorsEngaged: startup._count.crmInvestors,
      decksShared: startup._count.pitchDecks,
      metrics: startup.metrics,
    };
  }

  /**
   * List all public profiles
   */
  async listPublicProfiles(
    skip = 0,
    take = 20,
    filters?: {
      industry?: string;
      stage?: string;
      tags?: string[];
    },
  ) {
    const where: any = {
      visibility: { in: ['public', 'anonymous'] },
    };

    if (filters?.industry) {
      where.industry = filters.industry;
    }
    if (filters?.stage) {
      where.currentStage = filters.stage;
    }
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          industry: true,
          currentStage: true,
          targetAmount: true,
          raised: true,
          teamSize: true,
        },
      }),
      this.prisma.startup.count({ where }),
    ]);

    return {
      startups: startups.map((s) => this.formatProfileResponse(s)),
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  /**
   * Search profiles by name
   */
  async searchProfiles(query: string, skip = 0, take = 20) {
    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where: {
          visibility: { in: ['public', 'anonymous'] },
          name: { search: query },
        },
        skip,
        take,
      }),
      this.prisma.startup.count({
        where: {
          visibility: { in: ['public', 'anonymous'] },
          name: { search: query },
        },
      }),
    ]);

    return {
      startups: startups.map((s) => this.formatProfileResponse(s)),
      total,
    };
  }

  /**
   * Get founder information
   */
  async getFounders(organizationId: string, startupId: string) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
      select: {
        id: true,
        founders: true,
      },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    return {
      startupId,
      founders: startup.founders || [],
    };
  }

  /**
   * Add founder
   */
  async addFounder(
    organizationId: string,
    startupId: string,
    founder: {
      name: string;
      email: string;
      title: string;
      linkedin?: string;
    },
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    const founders = (startup.founders as any[]) || [];
    founders.push(founder);

    return this.prisma.startup.update({
      where: { id: startupId },
      data: { founders },
    });
  }

  private formatProfileResponse(startup: any) {
    return {
      id: startup.id,
      name: startup.name,
      description: startup.description,
      website: startup.website,
      logo: startup.logo,
      industry: startup.industry,
      stage: startup.currentStage,
      fundingGoal: startup.targetAmount,
      funded: startup.raised,
      teamSize: startup.teamSize,
      visibility: startup.visibility,
    };
  }
}
