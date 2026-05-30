import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateInvestorDto, UpdateInvestorDto, SearchInvestorDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvestorsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new investor record
   */
  async create(organizationId: string, createInvestorDto: CreateInvestorDto) {
    const { firstName, lastName, email, ...rest } = createInvestorDto;

    return this.prisma.investor.create({
      data: {
        organizationId,
        firstName,
        lastName,
        email,
        ...rest,
      },
      include: {
        embedding: true,
      },
    });
  }

  /**
   * Get all investors for organization
   */
  async findAll(organizationId: string, skip = 0, take = 20) {
    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where: { organizationId },
        skip,
        take,
        include: { embedding: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.investor.count({
        where: { organizationId },
      }),
    ]);

    return {
      data: investors,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get single investor
   */
  async findOne(organizationId: string, investorId: string) {
    const investor = await this.prisma.investor.findFirst({
      where: {
        id: investorId,
        organizationId,
      },
      include: {
        embedding: true,
        crmRecords: true,
      },
    });

    if (!investor) {
      throw new NotFoundException('Investor not found');
    }

    return investor;
  }

  /**
   * Update investor
   */
  async update(
    organizationId: string,
    investorId: string,
    updateInvestorDto: UpdateInvestorDto,
  ) {
    const investor = await this.findOne(organizationId, investorId);

    return this.prisma.investor.update({
      where: { id: investor.id },
      data: updateInvestorDto,
      include: { embedding: true },
    });
  }

  /**
   * Delete investor
   */
  async delete(organizationId: string, investorId: string) {
    const investor = await this.findOne(organizationId, investorId);

    return this.prisma.investor.update({
      where: { id: investor.id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Advanced search with filters
   */
  async search(organizationId: string, searchDto: SearchInvestorDto) {
    const {
      query,
      sectors = [],
      stages = [],
      geography,
      checkSizeMin,
      checkSizeMax,
      leadInvestor,
      skip = 0,
      take = 20,
    } = searchDto;

    const where: Prisma.InvestorWhereInput = {
      organizationId,
      deletedAt: null,
    };

    // Text search on name, email, bio
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filter by sectors
    if (sectors.length > 0) {
      where.sectors = {
        hasSome: sectors,
      };
    }

    // Filter by stages
    if (stages.length > 0) {
      where.stages = {
        hasSome: stages,
      };
    }

    // Filter by geography
    if (geography) {
      where.geography = {
        path: ['countries'],
        array_contains: [geography],
      };
    }

    // Filter by check size
    if (checkSizeMin !== undefined || checkSizeMax !== undefined) {
      where.AND = [
        checkSizeMin ? { checkSizeMin: { gte: checkSizeMin } } : {},
        checkSizeMax ? { checkSizeMax: { lte: checkSizeMax } } : {},
      ].filter((f) => Object.keys(f).length > 0);
    }

    // Filter by lead investor
    if (leadInvestor !== undefined) {
      where.leadInvestor = leadInvestor;
    }

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        skip,
        take,
        include: { embedding: true },
      }),
      this.prisma.investor.count({ where }),
    ]);

    return {
      data: investors,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get investor portfolio
   */
  async getPortfolio(organizationId: string, investorId: string) {
    const investor = await this.findOne(organizationId, investorId);

    return {
      investorId: investor.id,
      name: `${investor.firstName} ${investor.lastName}`,
      portfolio: investor.portfolio || [],
      recentInvestments: investor.recentInvestments || [],
      totalInvestments: (investor.portfolio || []).length,
    };
  }

  /**
   * Import investors
   */
  async importInvestors(organizationId: string, investors: CreateInvestorDto[]) {
    const results = await Promise.allSettled(
      investors.map((investor) => this.create(organizationId, investor)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      imported: successful,
      failed,
      total: investors.length,
    };
  }

  /**
   * Bulk update investors
   */
  async bulkUpdate(
    organizationId: string,
    investorIds: string[],
    updates: Record<string, any>,
  ) {
    const result = await this.prisma.investor.updateMany({
      where: {
        id: { in: investorIds },
        organizationId,
      },
      data: updates,
    });

    return {
      updated: result.count,
      total: investorIds.length,
    };
  }

  /**
   * Get investors by geographic criteria
   */
  async findByGeography(organizationId: string, country?: string, state?: string) {
    return this.prisma.investor.findMany({
      where: {
        organizationId,
        geography: {
          path: country ? ['countries'] : ['states'],
          array_contains: country ? [country] : state ? [state] : [],
        },
      },
    });
  }

  /**
   * Get investors by sector
   */
  async findBySector(organizationId: string, sector: string) {
    return this.prisma.investor.findMany({
      where: {
        organizationId,
        sectors: {
          hasSome: [sector],
        },
      },
      orderBy: { lastEngagementAt: 'desc' },
    });
  }

  /**
   * Get investors by stage
   */
  async findByStage(organizationId: string, stage: string) {
    return this.prisma.investor.findMany({
      where: {
        organizationId,
        stages: {
          hasSome: [stage],
        },
      },
    });
  }

  /**
   * Get investors by check size range
   */
  async findByCheckSize(organizationId: string, min: number, max: number) {
    return this.prisma.investor.findMany({
      where: {
        organizationId,
        AND: [{ checkSizeMin: { lte: max } }, { checkSizeMax: { gte: min } }],
      },
    });
  }
}
