import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class EmailCampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, startupId: string, data: any) {
    return this.prisma.emailCampaign.create({
      data: { organizationId, startupId, ...data },
    });
  }

  async findAll(organizationId: string, startupId?: string, skip = 0, take = 20) {
    const where = { organizationId, ...(startupId && { startupId }) };
    const [data, total] = await Promise.all([
      this.prisma.emailCampaign.findMany({ where, skip, take }),
      this.prisma.emailCampaign.count({ where }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(organizationId: string, id: string) {
    const campaign = await this.prisma.emailCampaign.findFirst({
      where: { id, organizationId },
      include: { emails: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(organizationId: string, id: string, data: any) {
    const campaign = await this.findOne(organizationId, id);
    return this.prisma.emailCampaign.update({ where: { id: campaign.id }, data });
  }

  async delete(organizationId: string, id: string) {
    const campaign = await this.findOne(organizationId, id);
    return this.prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: { deletedAt: new Date() },
    });
  }
}
