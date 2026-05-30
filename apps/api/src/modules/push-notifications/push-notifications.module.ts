import { Module } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { PushNotificationsController } from './push-notifications.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  controllers: [PushNotificationsController],
  providers: [PushNotificationsService, PrismaService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
