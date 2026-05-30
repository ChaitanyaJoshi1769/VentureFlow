import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class FounderMatchingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Match founders with advisors
   */
  async matchWithAdvisors(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Simulate advisor matching
    const advisors = [
      {
        id: 'advisor_1',
        name: 'Sarah Chen',
        expertise: ['Product', 'SaaS', 'Scaling'],
        portfolio: 12,
        availability: 'Moderate',
        matchScore: 92,
        reason: 'Deep SaaS scaling experience, perfect fit for your stage',
      },
      {
        id: 'advisor_2',
        name: 'Mark Johnson',
        expertise: ['Go-to-Market', 'Sales', 'Enterprise'],
        portfolio: 8,
        availability: 'High',
        matchScore: 85,
        reason: 'Strong GTM expertise needed for your growth phase',
      },
      {
        id: 'advisor_3',
        name: 'Lisa Wang',
        expertise: ['Fundraising', 'Investor Relations', 'Strategy'],
        portfolio: 15,
        availability: 'Low',
        matchScore: 88,
        reason: 'Experienced fundraiser with excellent investor network',
      },
    ];

    return {
      startupId,
      startupName: startup.name,
      topMatches: advisors,
      guidance: {
        idealAdvisorCount: 3,
        recommendedMix: ['Product/Technical', 'Go-to-Market', 'Finance/Fundraising'],
        equityRange: '0.25% - 1% per advisor',
        commitmentExpectation: '2-4 hours per month',
      },
    };
  }

  /**
   * Match founders with co-founders
   */
  async matchCoFounders(
    organizationId: string,
    startupId: string,
    founderProfile: any,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Simulate co-founder matching
    const potentialCoFounders = [
      {
        id: 'person_1',
        name: 'Alex Kumar',
        skills: ['Engineering', 'ML', 'DevOps'],
        experience: 8,
        motivation: 'Building AI products',
        matchScore: 94,
        compatibilityFactors: ['Technical depth', 'Startup experience', 'Vision alignment'],
      },
      {
        id: 'person_2',
        name: 'Jordan Lee',
        skills: ['Sales', 'Growth', 'Strategy'],
        experience: 6,
        motivation: 'Scaling startups',
        matchScore: 87,
        compatibilityFactors: ['GTM expertise', 'Network', 'Hustle mentality'],
      },
    ];

    return {
      startupId,
      currentFounders: startup.founderCount || 1,
      recommendations: potentialCoFounders,
      guidance: {
        idealTeamSize: 2-3,
        skillGaps: ['Product/Engineering', 'Sales/GTM'],
        lookingFor: 'Strong technical founder + business-focused operator',
        vettingProcess: [
          'Working together on project',
          'Reference checks',
          'Equity negotiation',
          'Legal agreement',
        ],
      },
    };
  }

  /**
   * Get founder resources
   */
  async getFounderResources(startupId: string) {
    return {
      startupId,
      resources: {
        courses: [
          'Y Combinator Startup School',
          'How to Raise Money',
          'Building Your Board',
        ],
        books: [
          'The Art of the Start - Guy Kawasaki',
          'The Lean Startup - Eric Ries',
          'Zero to One - Peter Thiel',
        ],
        communities: [
          'Founder groups',
          'Industry associations',
          'Online networks',
        ],
      },
    };
  }

  /**
   * Assess founder-market fit
   */
  async assessFounderMarketFit(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    return {
      startupId,
      assessment: {
        domainExpertise: 92,
        marketUnderstanding: 88,
        executionAbility: 85,
        teamComposition: 80,
        overallFit: 86,
      },
      strengths: [
        'Deep domain expertise',
        'Clear market understanding',
        'Execution track record',
      ],
      areasForGrowth: [
        'Team building',
        'Fundraising experience',
        'Operating scale',
      ],
      recommendation: 'Strong founder-market fit. Ready for significant capital.',
    };
  }
}
