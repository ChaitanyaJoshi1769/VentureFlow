import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreatePitchDeckDto, UpdatePitchDeckDto } from './dto';
import { nanoid } from 'nanoid';

@Injectable()
export class PitchDecksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new pitch deck
   */
  async create(organizationId: string, startupId: string, createPitchDeckDto: CreatePitchDeckDto) {
    // Verify startup exists
    await this.prisma.startup.findFirstOrThrow({
      where: { id: startupId, organizationId },
    });

    const shareToken = nanoid(32);

    return this.prisma.pitchDeck.create({
      data: {
        organizationId,
        startupId,
        ...createPitchDeckDto,
        shareToken,
        shareTokenExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }

  /**
   * Get all pitch decks for startup
   */
  async findByStartup(organizationId: string, startupId: string, skip = 0, take = 20) {
    const [decks, total] = await Promise.all([
      this.prisma.pitchDeck.findMany({
        where: { organizationId, startupId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pitchDeck.count({
        where: { organizationId, startupId },
      }),
    ]);

    return {
      data: decks,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get single pitch deck
   */
  async findOne(organizationId: string, deckId: string) {
    const deck = await this.prisma.pitchDeck.findFirst({
      where: { id: deckId, organizationId },
      include: { views: { take: 10, orderBy: { viewedAt: 'desc' } } },
    });

    if (!deck) {
      throw new NotFoundException('Pitch deck not found');
    }

    return deck;
  }

  /**
   * Update pitch deck
   */
  async update(
    organizationId: string,
    deckId: string,
    updatePitchDeckDto: UpdatePitchDeckDto,
  ) {
    const deck = await this.findOne(organizationId, deckId);

    // If versioning, create a new version instead
    if (updatePitchDeckDto.createNewVersion) {
      const newVersion = await this.prisma.pitchDeck.create({
        data: {
          organizationId,
          startupId: deck.startupId,
          title: updatePitchDeckDto.title || deck.title,
          description: updatePitchDeckDto.description || deck.description,
          fileUrl: updatePitchDeckDto.fileUrl || deck.fileUrl,
          s3Key: updatePitchDeckDto.s3Key || deck.s3Key,
          slideCount: updatePitchDeckDto.slideCount || deck.slideCount,
          version: (deck.version || 1) + 1,
          parentDeckId: deck.id,
          shareToken: nanoid(32),
          shareTokenExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });

      return newVersion;
    }

    return this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: updatePitchDeckDto,
    });
  }

  /**
   * Delete pitch deck
   */
  async delete(organizationId: string, deckId: string) {
    const deck = await this.findOne(organizationId, deckId);

    return this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Generate share link
   */
  async generateShareLink(organizationId: string, deckId: string, expiresInDays = 90) {
    const deck = await this.findOne(organizationId, deckId);

    const shareToken = nanoid(32);
    const shareTokenExpiry = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: { shareToken, shareTokenExpiry },
    });

    return {
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/deck/${shareToken}/view`,
      expiresAt: shareTokenExpiry,
    };
  }

  /**
   * Record deck view
   */
  async recordView(
    shareToken: string,
    viewerEmail?: string,
    investorId?: string,
    deviceType?: string,
    country?: string,
    city?: string,
  ) {
    const deck = await this.prisma.pitchDeck.findUnique({
      where: { shareToken },
    });

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // Check if share token expired
    if (deck.shareTokenExpiry && deck.shareTokenExpiry < new Date()) {
      throw new BadRequestException('Share link has expired');
    }

    // Record view
    await this.prisma.deckView.create({
      data: {
        deckId: deck.id,
        viewerEmail,
        investorId,
        deviceType,
        country,
        city,
        userAgent: 'User-Agent header',
      },
    });

    // Update deck view count
    await this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: {
        totalViews: { increment: 1 },
        uniqueViewers: viewerEmail
          ? { increment: 1 }
          : investorId
            ? { increment: 1 }
            : undefined,
      },
    });

    return deck;
  }

  /**
   * Get deck analytics
   */
  async getAnalytics(organizationId: string, deckId: string) {
    const deck = await this.findOne(organizationId, deckId);

    const views = await this.prisma.deckView.findMany({
      where: { deckId: deck.id },
      orderBy: { viewedAt: 'desc' },
    });

    const uniqueViewers = new Set(
      views.map((v) => v.viewerEmail || v.investorId).filter(Boolean),
    ).size;

    const avgViewDuration =
      views.length > 0
        ? views.reduce((sum, v) => sum + (v.viewDuration || 0), 0) / views.length
        : 0;

    const viewsByCountry = views.reduce(
      (acc, v) => {
        const country = v.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const viewsByDevice = views.reduce(
      (acc, v) => {
        const device = v.deviceType || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      deckId: deck.id,
      title: deck.title,
      totalViews: deck.totalViews,
      uniqueViewers,
      averageViewDuration: avgViewDuration,
      viewsByCountry,
      viewsByDevice,
      recentViews: views.slice(0, 10),
      engagementScore: this.calculateEngagementScore(views, deck),
    };
  }

  /**
   * Get view details for a specific view
   */
  async getViewDetails(organizationId: string, viewId: string) {
    return this.prisma.deckView.findFirst({
      where: { id: viewId },
      include: { deck: { include: { startup: true } } },
    });
  }

  /**
   * Publish deck (make it public)
   */
  async publish(organizationId: string, deckId: string) {
    const deck = await this.findOne(organizationId, deckId);

    return this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: { status: 'published', isPublic: true },
    });
  }

  /**
   * Archive deck
   */
  async archive(organizationId: string, deckId: string) {
    const deck = await this.findOne(organizationId, deckId);

    return this.prisma.pitchDeck.update({
      where: { id: deck.id },
      data: { status: 'archived' },
    });
  }

  /**
   * Calculate engagement score based on views
   */
  private calculateEngagementScore(views: any[], deck: any): number {
    if (views.length === 0) return 0;

    const weights = {
      views: 0.3,
      uniqueViewers: 0.4,
      avgDuration: 0.3,
    };

    const viewsScore = Math.min(views.length / 100, 1);
    const uniqueScore = Math.min(
      views.filter((v) => v.viewerEmail || v.investorId).length / 50,
      1,
    );
    const durationScore = Math.min(
      views.reduce((sum, v) => sum + (v.viewDuration || 0), 0) / (views.length * 300),
      1,
    );

    return (
      (viewsScore * weights.views +
        uniqueScore * weights.uniqueViewers +
        durationScore * weights.avgDuration) *
      100
    );
  }
}
