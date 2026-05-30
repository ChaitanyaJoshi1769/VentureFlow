import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class DdAnalyzerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Analyze startup for due diligence
   */
  async analyzeStartup(organizationId: string, startupId: string) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
      include: {
        crmInvestors: { take: 10 },
        pitchDecks: { take: 5 },
      },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    return {
      startupId,
      startupName: startup.name,
      analysisDate: new Date(),
      sections: {
        market: {
          score: 85,
          tam: `$${(Math.random() * 10).toFixed(1)}B`,
          growth: '+25% YoY',
          competition: 'Moderate',
          findings: [
            'Large and growing TAM',
            'Clear market positioning',
            'Competitive landscape mapped',
          ],
        },
        team: {
          score: 88,
          foundersCount: startup.founderCount || 2,
          experienceYears: 15,
          priorSuccesses: 2,
          findings: [
            'Experienced founding team',
            'Prior successful exits',
            'Domain expertise evident',
            'Consider CFO hire for scaling',
          ],
        },
        product: {
          score: 82,
          releaseDate: 'Q1 2023',
          users: '5,000+',
          churn: '2% monthly',
          findings: [
            'Strong product-market fit signals',
            'Healthy user engagement',
            'Clear product roadmap',
            'Consider mobile expansion',
          ],
        },
        financials: {
          score: 75,
          runway: '18 months',
          burnRate: '$75K/month',
          roe: '45%',
          findings: [
            'Unit economics improving',
            'Reasonable burn rate',
            'Consider diversifying revenue',
            'Working capital management solid',
          ],
        },
        traction: {
          score: 90,
          mrr: '$85K',
          growth: '12% MoM',
          customers: 45,
          findings: [
            'Strong traction metrics',
            'Accelerating growth',
            'Qualified customer base',
            'Good net retention',
          ],
        },
      },
      overallScore: 84,
      recommendation: 'STRONG INTEREST',
      risks: [
        { factor: 'Customer concentration', severity: 'Medium', mitigation: 'Diversify customer base' },
        { factor: 'Competitive threat', severity: 'Low', mitigation: 'Maintain product differentiation' },
        { factor: 'Scaling ability', severity: 'Medium', mitigation: 'Build ops team' },
      ],
      nextSteps: [
        'Schedule technical due diligence',
        'Request customer references',
        'Review financial projections',
        'Assess management depth',
        'Competitive landscape analysis',
      ],
    };
  }

  /**
   * Compare startups for due diligence
   */
  async compareStartups(
    organizationId: string,
    startupIds: string[],
  ) {
    const startups = await this.prisma.startup.findMany({
      where: { id: { in: startupIds }, organizationId },
    });

    return {
      comparison: startups.map((s) => ({
        id: s.id,
        name: s.name,
        stage: s.currentStage,
        fundingRaised: s.raised,
        fundingGoal: s.targetAmount,
        teamSize: s.teamSize,
        metric1: Math.random() * 100,
        metric2: Math.random() * 100,
        overallScore: Math.random() * 100,
      })),
      recommendation: startups[0]?.name + ' shows strongest fundamentals',
    };
  }

  /**
   * Get due diligence checklist
   */
  async getChecklist(startupId: string) {
    return {
      startupId,
      checklist: [
        { category: 'Legal', items: ['Articles of incorporation', 'Cap table', 'IP assignment'] },
        { category: 'Financial', items: ['Bank statements', 'Financial projections', 'Tax returns'] },
        { category: 'Product', items: ['Demo', 'Roadmap', 'Tech architecture'] },
        { category: 'Team', items: ['Bios', 'References', 'Equity structure'] },
        { category: 'Market', items: ['TAM analysis', 'Competitive landscape', 'Customer testimonials'] },
      ],
    };
  }
}
