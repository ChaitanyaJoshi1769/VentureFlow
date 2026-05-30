import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/push-notifications')
@UseGuards(JwtGuard)
export class PushNotificationsController {
  constructor(private pushService: PushNotificationsService) {}

  @Post('register-device')
  async registerDevice(
    @Request() req: any,
    @Body() { deviceToken, deviceType }: any,
  ) {
    return this.pushService.registerDevice(req.user.id, deviceToken, deviceType);
  }

  @Post('send')
  async sendNotification(
    @Request() req: any,
    @Body() { title, body, data }: any,
  ) {
    return this.pushService.sendPushNotification(req.user.id, title, body, data);
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.pushService.getNotificationHistory(req.user.id);
  }

  @Post('unregister-device')
  async unregisterDevice(@Body() { deviceToken }: any) {
    return this.pushService.unregisterDevice(deviceToken);
  }
}
