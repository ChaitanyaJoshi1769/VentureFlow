import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { CreateStartupDto, UpdateStartupDto } from './dto';

@Injectable()
export class StartupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new startup profile
   */
  async create(organizationId: string, createStartupDto: CreateStartupDto) {
    return this.prisma.startup.create({
      data: {
        organizationId,
        ...createStartupDto,
      },
      include: { embedding: true },
    });
  }

  /**
   * Get all startups for organization
   */
  async findAll(organizationId: string, skip = 0, take = 20) {
    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where: { organizationId },
        skip,
        take,
        include: { embedding: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.startup.count({
        where: { organizationId },
      }),
    ]);

    return {
      data: startups,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get single startup
   */
  async findOne(organizationId: string, startupId: string) {
    const startup = await this.prisma.startup.findFirst({
      where: {
        id: startupId,
        organizationId,
      },
      include: {
        embedding: true,
        crmInvestors: { include: { investor: true } },
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return startup;
  }

  /**
   * Update startup
   */
  async update(organizationId: string, startupId: string, updateStartupDto: UpdateStartupDto) {
    const startup = await this.findOne(organizationId, startupId);

    return this.prisma.startup.update({
      where: { id: startup.id },
      data: updateStartupDto,
      include: { embedding: true },
    });
  }

  /**
   * Delete startup
   */
  async delete(organizationId: string, startupId: string) {
    const startup = await this.findOne(organizationId, startupId);

    return this.prisma.startup.update({
      where: { id: startup.id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get startup CRM pipeline
   */
  async getCRM(organizationId: string, startupId: string) {
    const startup = await this.findOne(organizationId, startupId);

    const crmInvestors = await this.prisma.crmInvestor.findMany({
      where: { startupId: startup.id },
      include: { investor: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      startupId: startup.id,
      startupName: startup.name,
      investors: crmInvestors,
    };
  }

  /**
   * Search startups
   */
  async search(organizationId: string, query: string, skip = 0, take = 20) {
    const [startups, total] = await Promise.all([
      this.prisma.startup.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        include: { embedding: true },
      }),
      this.prisma.startup.count({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      data: startups,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      hasMore: skip + take < total,
    };
  }

  /**
   * Get startups by stage
   */
  async findByStage(organizationId: string, stage: string) {
    return this.prisma.startup.findMany({
      where: {
        organizationId,
        currentStage: stage,
      },
    });
  }

  /**
   * Get startups by industry
   */
  async findByIndustry(organizationId: string, industry: string) {
    return this.prisma.startup.findMany({
      where: {
        organizationId,
        industry,
      },
    });
  }
}
