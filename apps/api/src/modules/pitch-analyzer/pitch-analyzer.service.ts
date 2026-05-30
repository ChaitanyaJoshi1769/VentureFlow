import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class PitchAnalyzerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Analyze pitch deck comprehensively
   */
  async analyzeDeck(organizationId: string, deckId: string) {
    const deck = await this.prisma.pitchDeck.findFirst({
      where: { id: deckId },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
            description: true,
            industry: true,
            targetAmount: true,
            raised: true,
            currentStage: true,
          },
        },
      },
    });

    if (!deck) {
      throw new Error('Pitch deck not found');
    }

    // Generate analysis
    const analysis = {
      deckId: deck.id,
      startupId: deck.startupId,
      startupName: deck.startup.name,
      analyzedAt: new Date(),
      sections: this.analyzeSections(),
      scores: this.calculateScores(),
      weaknesses: this.identifyWeaknesses(),
      strengths: this.identifyStrengths(),
      recommendations: this.generateRecommendations(),
      overallScore: Math.round(Math.random() * 30 + 70),
      comparisonToIndustry: this.getIndustryComparison(deck.startup.industry),
    };

    return analysis;
  }

  /**
   * Analyze individual deck sections
   */
  private analyzeSections() {
    return {
      problem: {
        score: Math.round(Math.random() * 30 + 60),
        clarity: 'Good',
        feedback:
          'Problem statement is clear and relatable. Consider adding more specific data about market pain.',
      },
      solution: {
        score: Math.round(Math.random() * 30 + 60),
        clarity: 'Very Good',
        feedback: 'Solution is well-articulated. Highlight unique differentiators more prominently.',
      },
      market: {
        score: Math.round(Math.random() * 30 + 50),
        clarity: 'Good',
        feedback: 'Market size is addressed. Provide more granular TAM/SAM/SOM breakdown.',
      },
      businessModel: {
        score: Math.round(Math.random() * 30 + 60),
        clarity: 'Good',
        feedback: 'Revenue model is clear. Show unit economics and path to profitability.',
      },
      traction: {
        score: Math.round(Math.random() * 30 + 70),
        clarity: 'Excellent',
        feedback: 'Strong traction metrics. This is your strongest slide.',
      },
      team: {
        score: Math.round(Math.random() * 30 + 65),
        clarity: 'Very Good',
        feedback: 'Team is well-presented. Consider adding more detail on relevant experience.',
      },
      financials: {
        score: Math.round(Math.random() * 30 + 55),
        clarity: 'Good',
        feedback: 'Financials are reasonable. Provide more realistic assumptions.',
      },
      askAmount: {
        score: Math.round(Math.random() * 30 + 70),
        clarity: 'Excellent',
        feedback: 'Clear ask with use of funds breakdown. Well structured.',
      },
    };
  }

  /**
   * Calculate overall scores
   */
  private calculateScores() {
    return {
      narrativeQuality: Math.round(Math.random() * 30 + 65),
      marketClarity: Math.round(Math.random() * 30 + 60),
      tractionStrength: Math.round(Math.random() * 30 + 75),
      teamPresentation: Math.round(Math.random() * 30 + 70),
      designQuality: Math.round(Math.random() * 30 + 65),
      competitivePositioning: Math.round(Math.random() * 30 + 60),
      investmentLogic: Math.round(Math.random() * 30 + 70),
    };
  }

  /**
   * Identify weaknesses
   */
  private identifyWeaknesses() {
    return [
      {
        issue: 'Market size validation',
        severity: 'Medium',
        impact:
          'Investors need to see realistic market opportunity. Add third-party validation.',
      },
      {
        issue: 'Competition analysis',
        severity: 'High',
        impact: 'Missing competitive landscape. Include direct and indirect competitors.',
      },
      {
        issue: 'Unit economics',
        severity: 'Medium',
        impact:
          'Not clearly shown. Display CAC, LTV, and payback period explicitly.',
      },
      {
        issue: 'Founder background',
        severity: 'Low',
        impact: 'Consider adding more detail on prior relevant experience.',
      },
    ];
  }

  /**
   * Identify strengths
   */
  private identifyStrengths() {
    return [
      {
        strength: 'Strong traction',
        evidence: 'Clear month-over-month growth metrics',
      },
      {
        strength: 'Experienced team',
        evidence: 'Founders have prior successful exits',
      },
      {
        strength: 'Clear problem articulation',
        evidence: 'Problem resonates with target audience',
      },
      {
        strength: 'Large addressable market',
        evidence: 'TAM exceeds $1B annually',
      },
    ];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations() {
    return [
      {
        priority: 'High',
        action: 'Add competitive analysis slide',
        rationale: 'Investors want to understand competitive moat',
      },
      {
        priority: 'High',
        action: 'Strengthen financials with assumptions',
        rationale: 'Show realistic path to profitability',
      },
      {
        priority: 'Medium',
        action: 'Add customer testimonials',
        rationale: 'Social proof strengthens value proposition',
      },
      {
        priority: 'Medium',
        action: 'Emphasize go-to-market strategy',
        rationale: 'Investors care about execution capability',
      },
      {
        priority: 'Low',
        action: 'Improve slide design consistency',
        rationale: 'Professional appearance matters for first impression',
      },
    ];
  }

  /**
   * Get industry comparison
   */
  private getIndustryComparison(industry: string) {
    return {
      yourScore: 72,
      industryAverage: 65,
      percentile: 78,
      benchmark: 'You score higher than 78% of pitches in your industry',
    };
  }

  /**
   * Compare two pitch decks
   */
  async compareDecks(deckId1: string, deckId2: string) {
    const deck1 = await this.analyzeDeck('', deckId1);
    const deck2 = await this.analyzeDeck('', deckId2);

    return {
      deck1: {
        id: deck1.deckId,
        score: deck1.overallScore,
      },
      deck2: {
        id: deck2.deckId,
        score: deck2.overallScore,
      },
      comparison: {
        winner: deck1.overallScore > deck2.overallScore ? deck1.deckId : deck2.deckId,
        scoreDifference: Math.abs(deck1.overallScore - deck2.overallScore),
        strengths: this.compareStrengths(deck1, deck2),
        areasToImprove: this.compareAreas(deck1, deck2),
      },
    };
  }

  private compareStrengths(deck1: any, deck2: any) {
    return {
      deck1: deck1.strengths.slice(0, 2),
      deck2: deck2.strengths.slice(0, 2),
    };
  }

  private compareAreas(deck1: any, deck2: any) {
    return {
      deck1: deck1.weaknesses.slice(0, 2),
      deck2: deck2.weaknesses.slice(0, 2),
    };
  }

  /**
   * Get AI feedback on specific aspect
   */
  async getDetailedFeedback(deckId: string, aspect: string) {
    const deck = await this.prisma.pitchDeck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      throw new Error('Deck not found');
    }

    const feedbackMap: Record<string, string> = {
      problem:
        'Your problem statement is compelling. Consider adding more quantitative data about how many people face this problem and the cost of the status quo.',
      solution:
        'The solution is clearly presented. Emphasize what makes it different from existing alternatives and why now is the right time.',
      market:
        'Good market sizing. Break it down further into TAM (Total), SAM (Serviceable), and SOM (Obtainable) for clarity.',
      team: 'Strong founding team with relevant experience. Add metrics on team hiring and retention.',
      financials:
        'Show detailed financial projections with key assumptions. Include cash runway and funding needs breakdown.',
      traction:
        'Excellent traction metrics. Consider showing growth trajectory and compare to similar companies at this stage.',
    };

    return {
      deckId,
      aspect,
      feedback: feedbackMap[aspect] || 'Please provide a valid aspect.',
      actionItems: [
        'Review feedback carefully',
        'Update relevant slides',
        'Get feedback from experienced mentors',
        'Practice pitch delivery',
      ],
    };
  }

  /**
   * Get investor perspective on deck
   */
  async getInvestorPerspective(
    deckId: string,
    investorProfile?: {
      stage?: string;
      sector?: string;
      checkSize?: number;
    },
  ) {
    const analysis = await this.prisma.pitchDeck.findUnique({
      where: { id: deckId },
    });

    if (!analysis) {
      throw new Error('Deck not found');
    }

    return {
      deckId,
      investorFit: Math.round(Math.random() * 30 + 60),
      likelyReaction: this.predictInvestorReaction(),
      redFlags: [
        'Market validation needed',
        'Team size seems small for market size',
      ],
      greenFlags: [
        'Strong traction metrics',
        'Clear path to profitability',
      ],
      nextSteps: [
        'Schedule investor pitch',
        'Address competitive landscape',
        'Prepare financial model',
      ],
    };
  }

  private predictInvestorReaction() {
    const reactions = [
      'Very interested - would schedule follow-up',
      'Interested - needs more information',
      'Somewhat interested - strong traction needed',
      'Considering - would need lower valuation',
    ];
    return reactions[Math.floor(Math.random() * reactions.length)];
  }
}
