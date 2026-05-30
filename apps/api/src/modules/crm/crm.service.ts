import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateCrmInvestorDto, UpdateCrmInvestorDto } from './dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a CRM record (add investor to startup pipeline)
   */
  async create(organizationId: string, createCrmDto: CreateCrmInvestorDto) {
    const { startupId, investorId, ...rest } = createCrmDto;

    // Verify startup and investor exist
    const [startup, investor] = await Promise.all([
      this.prisma.startup.findFirst({
        where: { id: startupId, organizationId },
      }),
      this.prisma.investor.findFirst({
        where: { id: investorId, organizationId },
      }),
    ]);

    if (!startup || !investor) {
      throw new BadRequestException('Startup or investor not found');
    }

    // Check if already exists
    const existing = await this.prisma.crmInvestor.findUnique({
      where: { startupId_investorId: { startupId, investorId } },
    });

    if (existing && !existing.deletedAt) {
      throw new BadRequestException('Investor already in CRM');
    }

    if (existing && existing.deletedAt) {
      return this.prisma.crmInvestor.update({
        where: { id: existing.id },
        data: { ...rest, deletedAt: null },
      });
    }

    return this.prisma.crmInvestor.create({
      data: {
        organizationId,
        startupId,
        investorId,
        ...rest,
      },
    });
  }

  /**
   * Get all CRM records for organization
   */
  async findAll(organizationId: string, skip = 0, take = 20) {
    const [records, total] = await Promise.all([
      this.prisma.crmInvestor.findMany({
        where: { organizationId },
        skip,
        take,
        include: { investor: true, startup: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.crmInvestor.count({ where: { organizationId } }),
    ]);

    return {
      data: records,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get CRM records for a startup
   */
  async findByStartup(organizationId: string, startupId: string, skip = 0, take = 20) {
    const [records, total] = await Promise.all([
      this.prisma.crmInvestor.findMany({
        where: { organizationId, startupId },
        skip,
        take,
        include: { investor: true },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.crmInvestor.count({
        where: { organizationId, startupId },
      }),
    ]);

    return {
      data: records,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get single CRM record
   */
  async findOne(organizationId: string, crmId: string) {
    const record = await this.prisma.crmInvestor.findFirst({
      where: { id: crmId, organizationId },
      include: { investor: true, startup: true, activities: true, notes: true },
    });

    if (!record) {
      throw new NotFoundException('CRM record not found');
    }

    return record;
  }

  /**
   * Update CRM record
   */
  async update(organizationId: string, crmId: string, updateCrmDto: UpdateCrmInvestorDto) {
    const record = await this.findOne(organizationId, crmId);

    return this.prisma.crmInvestor.update({
      where: { id: record.id },
      data: {
        ...updateCrmDto,
        lastEngagementAt: new Date(),
      },
      include: { investor: true, startup: true },
    });
  }

  /**
   * Delete CRM record
   */
  async delete(organizationId: string, crmId: string) {
    const record = await this.findOne(organizationId, crmId);

    return this.prisma.crmInvestor.update({
      where: { id: record.id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Move investor to different stage
   */
  async moveStage(organizationId: string, crmId: string, newStage: string) {
    return this.update(organizationId, crmId, {
      stage: newStage,
    });
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(organizationId: string, startupId?: string) {
    const where: any = { organizationId };
    if (startupId) {
      where.startupId = startupId;
    }

    const stages = await this.prisma.crmInvestor.groupBy({
      by: ['stage'],
      where,
      _count: true,
    });

    const stats = {
      total: 0,
      byStage: {} as Record<string, number>,
      averageScore: 0,
    };

    let totalScore = 0;
    let scorableRecords = 0;

    for (const stage of stages) {
      stats.byStage[stage.stage] = stage._count;
      stats.total += stage._count;
    }

    // Calculate average score
    const records = await this.prisma.crmInvestor.findMany({
      where,
      select: { relationshipScore: true },
    });

    if (records.length > 0) {
      totalScore = records.reduce((sum, r) => sum + (r.relationshipScore || 0), 0);
      stats.averageScore = totalScore / records.length;
    }

    return stats;
  }

  /**
   * Get investors by stage
   */
  async findByStage(organizationId: string, stage: string, startupId?: string) {
    return this.prisma.crmInvestor.findMany({
      where: {
        organizationId,
        stage,
        ...(startupId && { startupId }),
      },
      include: { investor: true },
      orderBy: { relationshipScore: 'desc' },
    });
  }

  /**
   * Bulk update multiple CRM records
   */
  async bulkUpdate(
    organizationId: string,
    crmIds: string[],
    updates: Record<string, any>,
  ) {
    const result = await this.prisma.crmInvestor.updateMany({
      where: {
        id: { in: crmIds },
        organizationId,
      },
      data: {
        ...updates,
        lastEngagementAt: new Date(),
      },
    });

    return {
      updated: result.count,
      total: crmIds.length,
    };
  }

  /**
   * Get upcoming follow-ups
   */
  async getUpcomingFollowUps(organizationId: string, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.crmInvestor.findMany({
      where: {
        organizationId,
        nextFollowUpAt: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: { investor: true, startup: true },
      orderBy: { nextFollowUpAt: 'asc' },
    });
  }
}
