import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class AiMatchingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate embeddings for startup (would use OpenAI API)
   */
  private async generateEmbeddings(text: string): Promise<number[]> {
    // In production, call OpenAI embeddings API
    // For now, return mock 1536-dimensional vector
    return Array(1536).fill(0).map(() => Math.random());
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Find matching investors for a startup
   */
  async findInvestorMatches(
    organizationId: string,
    startupId: string,
    limit = 20,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Generate startup embedding from description + tags
    const startupDescription = `${startup.name} ${startup.description} ${startup.tags?.join(' ') || ''}`;
    const startupEmbedding = await this.generateEmbeddings(startupDescription);

    // Get all investors
    const investors = await this.prisma.investor.findMany({
      where: { organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        firm: true,
        sectors: true,
        stages: true,
        bio: true,
      },
    });

    // Calculate match scores
    const matches = investors
      .map((investor) => {
        const investorDescription = `${investor.firstName} ${investor.lastName} ${investor.bio || ''} ${investor.sectors?.join(' ') || ''} ${investor.stages?.join(' ') || ''}`;
        const score = this.calculateMatchScore(
          startup,
          investor,
          investorDescription,
        );

        return {
          investorId: investor.id,
          name: `${investor.firstName} ${investor.lastName}`,
          title: investor.title,
          firm: investor.firm,
          matchScore: score,
          sectors: investor.sectors,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return {
      startupId,
      startupName: startup.name,
      matches,
      totalMatches: matches.length,
    };
  }

  /**
   * Find matching startups for an investor
   */
  async findStartupMatches(
    organizationId: string,
    investorId: string,
    limit = 20,
  ) {
    const investor = await this.prisma.investor.findFirst({
      where: { id: investorId, organizationId },
    });

    if (!investor) {
      throw new Error('Investor not found');
    }

    // Get all public startups
    const startups = await this.prisma.startup.findMany({
      where: { visibility: 'public' },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        currentStage: true,
        targetAmount: true,
        tags: true,
      },
    });

    // Calculate match scores
    const matches = startups
      .map((startup) => ({
        startupId: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.currentStage,
        fundingGoal: startup.targetAmount,
        matchScore: this.calculateInvestorStartupMatch(investor, startup),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return {
      investorId,
      investorName: `${investor.firstName} ${investor.lastName}`,
      matches,
      totalMatches: matches.length,
    };
  }

  /**
   * Calculate match score between startup and investor
   */
  private calculateMatchScore(
    startup: any,
    investor: any,
    description: string,
  ): number {
    let score = 0;

    // Sector match (40%)
    const sectorMatch =
      investor.sectors && investor.sectors.length > 0
        ? investor.sectors.some((s: string) => startup.tags?.includes(s))
          ? 1
          : 0
        : 0.5;
    score += sectorMatch * 40;

    // Stage match (40%)
    const stageMatch =
      investor.stages && investor.stages.length > 0
        ? investor.stages.includes(startup.currentStage)
          ? 1
          : 0
        : 0.5;
    score += stageMatch * 40;

    // Check size and other factors (20%)
    const fundingMatch = this.calculateFundingMatch(
      startup.targetAmount,
      investor.typicalCheckSize,
    );
    score += fundingMatch * 20;

    return Math.round(score);
  }

  /**
   * Calculate match score between investor and startup
   */
  private calculateInvestorStartupMatch(investor: any, startup: any): number {
    let score = 0;

    // Check if investor's sectors match startup
    const sectorMatch =
      investor.sectors && investor.sectors.length > 0
        ? investor.sectors.some((s: string) => startup.tags?.includes(s) || s === startup.industry)
          ? 1
          : 0
        : 0.5;
    score += sectorMatch * 40;

    // Check if investor invests in this stage
    const stageMatch =
      investor.stages && investor.stages.length > 0
        ? investor.stages.includes(startup.currentStage)
          ? 1
          : 0
        : 0.5;
    score += stageMatch * 40;

    // Funding size match
    const fundingMatch = startup.targetAmount
      ? Math.min(
          (investor.typicalCheckSize || 100000) / startup.targetAmount,
          1,
        )
      : 0.5;
    score += fundingMatch * 20;

    return Math.round(score);
  }

  /**
   * Calculate funding size match
   */
  private calculateFundingMatch(
    fundingGoal: number,
    typicalCheckSize: number,
  ): number {
    if (!fundingGoal || !typicalCheckSize) return 0.5;

    const ratio = typicalCheckSize / fundingGoal;
    if (ratio >= 0.1 && ratio <= 1) return 1; // Good fit
    if (ratio >= 0.05 && ratio < 0.1) return 0.8;
    if (ratio > 1 && ratio <= 2) return 0.8;
    return 0.5;
  }

  /**
   * Get match insights and recommendations
   */
  async getMatchInsights(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    const topMatches = await this.findInvestorMatches(organizationId, startupId, 5);

    return {
      startupId,
      topMatches: topMatches.matches,
      insights: {
        recommendedSectors: startup.tags || [],
        recommendedStages: [startup.currentStage],
        fundingSizeRange: {
          min: (startup.targetAmount || 0) * 0.1,
          max: (startup.targetAmount || 0) * 0.5,
        },
        nextSteps: [
          'Review investor track records',
          'Prepare personalized pitches',
          'Schedule warm introductions',
          'Follow up on investor interest',
        ],
      },
    };
  }

  /**
   * Batch match multiple startups
   */
  async batchMatchStartups(
    organizationId: string,
    startupIds: string[],
  ) {
    const matches = await Promise.all(
      startupIds.map((startupId) =>
        this.findInvestorMatches(organizationId, startupId, 10).catch(() => ({
          startupId,
          matches: [],
          totalMatches: 0,
        })),
      ),
    );

    return matches;
  }

  /**
   * Get matching quality score
   */
  async getMatchQuality(
    organizationId: string,
    investorId: string,
    startupId: string,
  ) {
    const investor = await this.prisma.investor.findFirst({
      where: { id: investorId, organizationId },
    });

    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!investor || !startup) {
      throw new Error('Investor or startup not found');
    }

    const score = this.calculateInvestorStartupMatch(investor, startup);

    return {
      investorId,
      startupId,
      matchScore: score,
      qualityRating: score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Fair',
      details: {
        sectorAlignment: investor.sectors?.some((s: string) =>
          startup.tags?.includes(s),
        )
          ? 'Yes'
          : 'No',
        stageAlignment: investor.stages?.includes(startup.currentStage)
          ? 'Yes'
          : 'No',
        fundingRange: 'Compatible',
      },
    };
  }
}
