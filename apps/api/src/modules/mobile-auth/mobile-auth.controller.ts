import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/mobile')
export class MobileAuthController {
  constructor(private mobileAuthService: MobileAuthService) {}

  @Post('login')
  async login(@Body() { email, password, deviceId }: any) {
    return this.mobileAuthService.mobileLogin(email, password, deviceId);
  }

  @Post('biometric-login')
  async biometricLogin(@Body() { userId, deviceId, biometricToken }: any) {
    return this.mobileAuthService.biometricLogin(userId, deviceId, biometricToken);
  }

  @Post('register-biometric')
  @UseGuards(JwtGuard)
  async registerBiometric(
    @Request() req: any,
    @Body() { biometricType }: any,
  ) {
    return this.mobileAuthService.registerBiometric(req.user.id, biometricType);
  }

  @Get('sessions')
  @UseGuards(JwtGuard)
  async getSessions(@Request() req: any) {
    return this.mobileAuthService.getMobileSessions(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Request() req: any, @Body() { deviceId }: any) {
    return this.mobileAuthService.mobileLogout(req.user.id, deviceId);
  }

  @Get('offline-sync')
  @UseGuards(JwtGuard)
  async getOfflineData(@Request() req: any) {
    return this.mobileAuthService.getOfflineSyncData(req.user.id, req.user.organizationId);
  }
}
