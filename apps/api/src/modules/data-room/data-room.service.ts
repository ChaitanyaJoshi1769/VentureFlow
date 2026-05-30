import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class DataRoomService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, startupId: string, data: any) {
    return this.prisma.document.create({ data: { organizationId, startupId, ...data } });
  }

  async findAll(organizationId: string, startupId: string) {
    return this.prisma.document.findMany({ where: { organizationId, startupId } });
  }
}
