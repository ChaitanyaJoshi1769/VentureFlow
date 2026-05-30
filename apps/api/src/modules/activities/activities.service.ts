import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, crmInvestorId: string, data: any) {
    return this.prisma.activity.create({
      data: { organizationId, crmInvestorId, ...data },
    });
  }

  async findAll(organizationId: string, crmInvestorId?: string, skip = 0, take = 20) {
    const where = { organizationId, ...(crmInvestorId && { crmInvestorId }) };
    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.activity.count({ where }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(organizationId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, organizationId },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }
}
