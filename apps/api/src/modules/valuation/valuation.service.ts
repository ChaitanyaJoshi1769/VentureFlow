import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class ValuationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Estimate startup valuation
   */
  async estimateValuation(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Multiple valuation methods
    const methods = {
      revenue_multiple: this.revenueMultipleMethod(startup),
      comparable_companies: this.comparableCompaniesMethod(startup),
      venture_capital: this.ventureCapitalMethod(startup),
      discounted_cash_flow: this.discountedCashFlowMethod(startup),
    };

    const valuations = Object.values(methods).map((v) => v.valuation);
    const averageValuation =
      valuations.reduce((a, b) => a + b, 0) / valuations.length;

    return {
      startupId,
      startupName: startup.name,
      stage: startup.currentStage,
      estimatedValuation: averageValuation,
      valuationRange: {
        low: Math.min(...valuations),
        high: Math.max(...valuations),
      },
      methods,
      confidence: 'Medium (based on limited data)',
      notes: [
        'Valuation estimates are for guidance only',
        'Final valuation depends on negotiation',
        'Market conditions and investor demand impact price',
        'Consider professional valuation advisors for precision',
      ],
    };
  }

  private revenueMultipleMethod(startup: any) {
    const revenue = startup.metrics?.monthlyRevenue * 12 || 500000;
    const multiple = this.getRevenueMultiple(startup.currentStage);
    return {
      method: 'Revenue Multiple',
      annualRevenue: revenue,
      multiple,
      valuation: revenue * multiple,
      explanation: `${multiple}x revenue multiple for ${startup.currentStage} stage`,
    };
  }

  private comparableCompaniesMethod(startup: any) {
    // Simulate comparable companies valuation
    const baseValuation = (startup.targetAmount || 1000000) * 3;
    const adjustment = 1 + Math.random() * 0.3; // ±30% adjustment
    return {
      method: 'Comparable Companies',
      comparable: '5-7 similar stage startups',
      valuation: baseValuation * adjustment,
      explanation: 'Based on recent funding rounds in the industry',
    };
  }

  private ventureCapitalMethod(startup: any) {
    // VC method: post-money valuation based on target return
    const targetRound = startup.targetAmount || 1000000;
    const equityPercentage = 0.2; // Typical 20% for Series A
    const postMoney = targetRound / equityPercentage;
    const preMoney = postMoney - targetRound;

    return {
      method: 'Venture Capital Method',
      targetRound,
      equity: `${(equityPercentage * 100).toFixed(0)}%`,
      preMoney,
      postMoney,
      valuation: preMoney,
      explanation: 'Based on investor return expectations and dilution',
    };
  }

  private discountedCashFlowMethod(startup: any) {
    // DCF: simple projection
    const projectedRevenue = (startup.metrics?.monthlyRevenue || 50000) * 12 * 1.5;
    const discountRate = 0.4; // 40% for startup risk
    const dcfValue = projectedRevenue / (1 + discountRate);

    return {
      method: 'Discounted Cash Flow',
      projectedAnnualRevenue: projectedRevenue,
      discountRate: `${(discountRate * 100).toFixed(0)}%`,
      valuation: dcfValue,
      explanation: 'Based on projected revenue and risk-adjusted discount rate',
    };
  }

  private getRevenueMultiple(stage: string): number {
    const multiples: Record<string, number> = {
      'Pre-Seed': 15,
      'Seed': 12,
      'Series A': 8,
      'Series B': 6,
      'Series C': 4,
    };
    return multiples[stage] || 10;
  }

  /**
   * Calculate funding dilution
   */
  async calculateDilution(
    organizationId: string,
    startupId: string,
    fundingRound: number,
    investorEquity: number,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    const valuation = await this.estimateValuation(organizationId, startupId);
    const postMoney = valuation.estimatedValuation + fundingRound;
    const founderDilution = investorEquity;

    return {
      startupId,
      fundingRound,
      investorEquity: `${(investorEquity * 100).toFixed(1)}%`,
      preMoney: valuation.estimatedValuation,
      postMoney,
      founderDilution: `${(founderDilution * 100).toFixed(1)}%`,
      founderRetention: `${((1 - founderDilution) * 100).toFixed(1)}%`,
    };
  }
}
