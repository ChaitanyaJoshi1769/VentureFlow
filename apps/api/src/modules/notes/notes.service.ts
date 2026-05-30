import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, crmInvestorId: string, data: any) {
    return this.prisma.note.create({
      data: { organizationId, crmInvestorId, ...data },
    });
  }

  async findAll(organizationId: string, crmInvestorId?: string, skip = 0, take = 20) {
    const where = { organizationId, ...(crmInvestorId && { crmInvestorId }) };
    const [data, total] = await Promise.all([
      this.prisma.note.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.note.count({ where }),
    ]);
    return { data, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async update(organizationId: string, id: string, data: any) {
    const note = await this.prisma.note.findFirst({ where: { id, organizationId } });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.note.update({ where: { id }, data });
  }

  async delete(organizationId: string, id: string) {
    const note = await this.prisma.note.findFirst({ where: { id, organizationId } });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
