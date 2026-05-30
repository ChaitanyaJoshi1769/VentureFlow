import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class InvestorPortalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get investor dashboard overview
   */
  async getInvestorDashboard(investorId: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id: investorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        firm: true,
        profilePicture: true,
        sectors: true,
        stages: true,
      },
    });

    if (!investor) {
      throw new Error('Investor not found');
    }

    // Get startups that match investor profile
    const matchingStartups = await this.prisma.startup.findMany({
      where: {
        visibility: 'public',
        tags: { hasSome: investor.sectors },
        currentStage: { in: investor.stages },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        industry: true,
        raised: true,
        targetAmount: true,
      },
    });

    return {
      investor,
      matchingStartups,
      totalMatches: matchingStartups.length,
    };
  }

  /**
   * Get investor's interaction history
   */
  async getInteractionHistory(investorId: string) {
    const interactions = await this.prisma.pitchDeckView.findMany({
      where: {
        investorEmail: undefined, // Placeholder
      },
      include: {
        pitchDeck: {
          select: {
            id: true,
            title: true,
            startup: { select: { name: true } },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    });

    return interactions;
  }

  /**
   * Search startups for investor
   */
  async searchStartups(
    investorId: string,
    query: string,
    filters?: {
      sector?: string;
      stage?: string;
      minFunding?: number;
      maxFunding?: number;
    },
  ) {
    const where: any = {
      visibility: 'public',
      name: { search: query },
    };

    if (filters?.sector) {
      where.industry = filters.sector;
    }
    if (filters?.stage) {
      where.currentStage = filters.stage;
    }
    if (filters?.minFunding) {
      where.targetAmount = { gte: filters.minFunding };
    }
    if (filters?.maxFunding) {
      where.targetAmount = {
        ...where.targetAmount,
        lte: filters.maxFunding,
      };
    }

    const startups = await this.prisma.startup.findMany({
      where,
      take: 20,
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        industry: true,
        currentStage: true,
        targetAmount: true,
        raised: true,
        teamSize: true,
      },
    });

    return startups;
  }

  /**
   * Get startup discovery recommendations
   */
  async getRecommendedStartups(investorId: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id: investorId },
      select: { sectors: true, stages: true },
    });

    if (!investor) {
      throw new Error('Investor not found');
    }

    const recommended = await this.prisma.startup.findMany({
      where: {
        visibility: 'public',
        tags: { hasSome: investor?.sectors || [] },
        currentStage: { in: investor?.stages || [] },
      },
      take: 15,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        industry: true,
        currentStage: true,
        targetAmount: true,
        raised: true,
        teamSize: true,
      },
    });

    return recommended;
  }

  /**
   * Request introduction to startup
   */
  async requestIntroduction(
    investorId: string,
    startupId: string,
    message?: string,
  ) {
    // Create introduction request
    const introRequest = await this.prisma.introductionRequest.create({
      data: {
        investorId,
        startupId,
        message: message || '',
        status: 'pending',
      },
    });

    return introRequest;
  }

  /**
   * Save startup to watchlist
   */
  async saveToWatchlist(investorId: string, startupId: string) {
    // Check if already saved
    const existing = await this.prisma.watchlist.findFirst({
      where: { investorId, startupId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.watchlist.create({
      data: {
        investorId,
        startupId,
      },
    });
  }

  /**
   * Get investor watchlist
   */
  async getWatchlist(investorId: string) {
    const watchlist = await this.prisma.watchlist.findMany({
      where: { investorId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            industry: true,
            currentStage: true,
            targetAmount: true,
            raised: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return watchlist.map((w) => w.startup);
  }

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(investorId: string, startupId: string) {
    return this.prisma.watchlist.delete({
      where: {
        investorId_startupId: { investorId, startupId },
      },
    });
  }

  /**
   * Rate startup
   */
  async rateStartup(
    investorId: string,
    startupId: string,
    rating: number,
    review?: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return this.prisma.startupRating.create({
      data: {
        investorId,
        startupId,
        rating,
        review: review || '',
      },
    });
  }

  /**
   * Request pitch deck
   */
  async requestPitchDeck(investorId: string, startupId: string) {
    return this.prisma.deckRequest.create({
      data: {
        investorId,
        startupId,
        status: 'pending',
      },
    });
  }

  /**
   * Get investor's portfolio view
   */
  async getPortfolioView(investorId: string) {
    const investorInvestments = await this.prisma.investment.findMany({
      where: { investorId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            currentStage: true,
            raised: true,
          },
        },
      },
    });

    const totalInvested = investorInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const averageReturn = Math.random() * 2.5; // Placeholder

    return {
      investments: investorInvestments,
      totalInvested,
      numberOfInvestments: investorInvestments.length,
      averageReturn,
    };
  }
}
