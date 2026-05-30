import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getFunnel(organizationId: string, startupId?: string) {
    const where = { organizationId, ...(startupId && { startupId }) };
    const stages = ['target', 'researching', 'contacted', 'followed_up', 'meeting_scheduled', 'partner_meeting', 'due_diligence', 'term_sheet', 'closed'];
    
    const funnel: any = {};
    for (const stage of stages) {
      funnel[stage] = await this.prisma.crmInvestor.count({
        where: { ...where, stage },
      });
    }
    return funnel;
  }

  async getPipeline(organizationId: string, startupId?: string) {
    return this.getFunnel(organizationId, startupId);
  }
}
