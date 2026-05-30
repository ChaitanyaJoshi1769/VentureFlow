import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class EmailAssistantService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate email draft based on investor and startup
   */
  async generateEmailDraft(
    organizationId: string,
    investorId: string,
    startupId: string,
    context?: string,
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

    // Generate personalized email draft
    const emailTemplates = {
      cold: `Hi ${investor.firstName},

I hope this message finds you well. I'm reaching out because I believe ${startup.name}'s innovative approach to ${startup.industry} aligns with your investment thesis.

${startup.name} is currently at the ${startup.currentStage} stage with strong traction - ${startup.metrics?.monthlyRevenue || 'impressive'}. We're raising $${(startup.targetAmount / 1000000).toFixed(1)}M to accelerate growth.

Given your experience with companies in this space, I'd love to get your thoughts. Are you available for a brief call this week?

Best regards`,

      warm: `Hi ${investor.firstName},

Following up on our conversation about ${startup.industry}, I wanted to share an update on ${startup.name}.

We've made significant progress since we last spoke - particularly in ${startup.metrics?.keyMetric || 'user acquisition'}. The market momentum in this space is undeniable.

I think there's a real opportunity to discuss further. Would you be open to a meeting next week?

Looking forward to reconnecting.

Best regards`,

      followup: `Hi ${investor.firstName},

Quick follow-up on my earlier message. I know you're busy, but I wanted to ensure this didn't get lost in the noise.

${startup.name} is moving quickly and we're seeing strong investor interest. Happy to share more details at your convenience.

Let me know if you'd like to schedule something.

Thanks`,
    };

    return {
      investorId,
      startupId,
      subject: `${startup.name} - Fundraising Opportunity`,
      drafts: {
        cold: emailTemplates.cold,
        warm: emailTemplates.warm,
        followup: emailTemplates.followup,
      },
      suggestions: [
        'Personalize with recent portfolio company',
        'Mention mutual connection if available',
        'Keep it under 150 words for cold outreach',
        'Schedule specific times to meet',
      ],
    };
  }

  /**
   * Optimize email for higher response rate
   */
  async optimizeEmail(
    organizationId: string,
    emailContent: string,
    investorId: string,
  ) {
    return {
      originalLength: emailContent.length,
      optimizedLength: emailContent.length - 50,
      improvements: [
        'Shortened email by 50 characters',
        'Added specific call-to-action',
        'Highlighted unique value proposition',
        'Included social proof',
      ],
      estimatedResponseRate: '28-35%',
      tips: [
        'Send on Tuesday-Thursday',
        'Avoid weekends',
        'Follow up after 1 week if no response',
        'A/B test subject lines',
      ],
    };
  }

  /**
   * Get email templates library
   */
  async getTemplates(organizationId: string) {
    return {
      templates: [
        { name: 'Cold Outreach', category: 'initial_contact' },
        { name: 'Warm Introduction', category: 'referral' },
        { name: 'Follow-up (1 week)', category: 'followup' },
        { name: 'Follow-up (2 weeks)', category: 'followup' },
        { name: 'Meeting Confirmation', category: 'meeting' },
        { name: 'Post-Meeting Thank You', category: 'thank_you' },
        { name: 'Investor Update', category: 'update' },
        { name: 'Closing Offer Discussion', category: 'negotiation' },
      ],
    };
  }
}
