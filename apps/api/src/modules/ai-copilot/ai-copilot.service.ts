import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class AiCopilotService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Create or get AI conversation
   */
  async getOrCreateConversation(
    organizationId: string,
    userId: string,
    startupId?: string,
  ) {
    let conversation = await this.prisma.aiConversation.findFirst({
      where: {
        organizationId,
        userId,
        startupId: startupId || null,
        status: 'active',
      },
    });

    if (!conversation) {
      conversation = await this.prisma.aiConversation.create({
        data: {
          organizationId,
          userId,
          startupId,
          title: `Fundraising Coach - ${new Date().toLocaleDateString()}`,
          messages: [],
        },
      });
    }

    return conversation;
  }

  /**
   * Send message to AI copilot
   */
  async sendMessage(
    organizationId: string,
    conversationId: string,
    userMessage: string,
  ) {
    const conversation = await this.prisma.aiConversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = (conversation.messages as any[]) || [];

    // Add user message
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Generate AI response (placeholder - would call Claude API)
    const aiResponse = await this.generateAiResponse(
      userMessage,
      messages,
      organizationId,
    );

    // Add AI response
    messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    // Update conversation
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { messages, updatedAt: new Date() },
    });

    return {
      conversationId,
      userMessage,
      aiResponse,
      timestamp: new Date(),
    };
  }

  /**
   * Generate AI response (Claude API integration)
   */
  private async generateAiResponse(
    userMessage: string,
    messages: any[],
    organizationId: string,
  ): Promise<string> {
    // This would call Claude API with conversation history
    // For now, return a template response
    const responses = [
      "Based on your traction, I'd recommend targeting investors who have invested in similar companies. Would you like me to help identify them?",
      "Your current metrics show strong product-market fit. Let's focus on creating a compelling narrative around your growth rate.",
      "I notice you haven't highlighted your competitive advantage. Let's refine your pitch to emphasize what makes you unique.",
      "Your cap table looks good. Now let's work on the investor targeting strategy based on your funding goals.",
      "Consider these three talking points for your next pitch meeting: traction, team, and market size.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    organizationId: string,
    conversationId: string,
  ) {
    return this.prisma.aiConversation.findFirst({
      where: { id: conversationId, organizationId },
    });
  }

  /**
   * List all conversations for user
   */
  async listConversations(organizationId: string, userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { organizationId, userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get AI recommendations for investor matching
   */
  async getInvestorRecommendations(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    // Find investors matching startup profile
    const matchingInvestors = await this.prisma.investor.findMany({
      where: {
        organizationId,
        sectors: { hasSome: startup.tags },
        stages: { hasSome: [startup.currentStage] },
      },
      take: 10,
    });

    return matchingInvestors.map((investor) => ({
      id: investor.id,
      name: `${investor.firstName} ${investor.lastName}`,
      title: investor.title,
      matchScore: Math.random() * 100, // Would be calculated from embeddings
      reason: 'Invested in similar companies in your sector',
    }));
  }

  /**
   * Analyze pitch deck
   */
  async analyzePitchDeck(
    organizationId: string,
    startupId: string,
  ) {
    const deck = await this.prisma.pitchDeck.findFirst({
      where: { startupId },
    });

    if (!deck) {
      throw new Error('No pitch deck found');
    }

    return {
      deckId: deck.id,
      analysis: {
        narrativeQuality: Math.random() * 100,
        marketClarity: Math.random() * 100,
        tractionStrength: Math.random() * 100,
        teamPresentation: Math.random() * 100,
        designQuality: Math.random() * 100,
        overallScore: Math.random() * 100,
      },
      recommendations: [
        'Add more specific traction metrics',
        'Clarify your competitive advantage',
        'Include customer testimonials',
        'Strengthen the market size narrative',
      ],
    };
  }

  /**
   * Generate fundraising strategy
   */
  async generateFundraisingStrategy(
    organizationId: string,
    startupId: string,
  ) {
    const startup = await this.prisma.startup.findFirst({
      where: { id: startupId, organizationId },
    });

    if (!startup) {
      throw new Error('Startup not found');
    }

    return {
      startupId,
      strategy: {
        targetAmount: startup.targetAmount,
        investorProfile: `Investors focused on ${startup.industry}`,
        timeline: '3-6 months',
        keyMessages: [
          'Market opportunity',
          'Product traction',
          'Team expertise',
          'Financial projections',
        ],
        steps: [
          'Warm outreach to 50 investors',
          'Schedule first meetings',
          'Refine pitch based on feedback',
          'Second meetings with interested investors',
          'Term sheet negotiations',
        ],
      },
    };
  }
}
