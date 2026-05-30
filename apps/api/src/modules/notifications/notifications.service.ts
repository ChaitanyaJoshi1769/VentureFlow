import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: any) {
    return this.prisma.notification.create({ data: { organizationId, userId, ...data } });
  }

  async findAll(organizationId: string, userId: string) {
    return this.prisma.notification.findMany({ where: { organizationId, userId } });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({ where: { id: notificationId }, data: { readAt: new Date() } });
  }
}
