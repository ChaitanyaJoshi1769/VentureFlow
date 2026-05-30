import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: any) {
    return this.prisma.task.create({ data: { organizationId, ...data } });
  }

  async findAll(organizationId: string) {
    return this.prisma.task.findMany({ where: { organizationId }, orderBy: { dueDate: 'asc' } });
  }

  async update(organizationId: string, id: string, data: any) {
    const task = await this.prisma.task.findFirst({ where: { id, organizationId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({ where: { id }, data });
  }

  async delete(organizationId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, organizationId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
