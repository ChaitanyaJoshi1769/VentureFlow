import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class WarmIntroService {
  constructor(private prisma: PrismaService) {}

  async findMutualConnections(organizationId: string, investorId: string) {
    const crm = await this.prisma.crmInvestor.findMany({
      where: { investorId, organizationId },
      include: { startup: { include: { crmInvestors: true } } },
    });

    return crm.map((c) => ({
      startup: c.startup.name,
      potentialIntroducers: c.startup.crmInvestors.filter((ci) => ci.stage === 'closed'),
    }));
  }
}
