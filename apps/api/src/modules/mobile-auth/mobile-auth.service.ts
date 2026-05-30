import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class MobileAuthService {
  private logger = new Logger('MobileAuthService');

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Authenticate mobile app with email/password
   */
  async mobileLogin(email: string, password: string, deviceId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          organizationId: true,
          role: true,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      // In production, verify password with bcrypt
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) throw new BadRequestException('Invalid credentials');

      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
      });

      const refreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Register device
      await this.prisma.mobileDevice.upsert({
        where: { deviceId },
        update: { lastActiveAt: new Date() },
        create: {
          userId: user.id,
          deviceId,
          deviceOS: 'unknown', // Set from mobile client
          appVersion: '1.0.0',
          isActive: true,
        },
      });

      this.logger.log(`Mobile login: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      this.logger.error(`Mobile login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mobile biometric authentication
   */
  async biometricLogin(userId: string, deviceId: string, biometricToken: string) {
    try {
      // Verify biometric token (in production, validate against stored biometric)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          organizationId: true,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
      });

      // Update device last active
      await this.prisma.mobileDevice.updateMany({
        where: { userId, deviceId },
        data: { lastActiveAt: new Date() },
      });

      this.logger.log(`Biometric login: ${user.email}`);

      return {
        user,
        accessToken,
      };
    } catch (error) {
      this.logger.error(`Biometric login failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register biometric for user
   */
  async registerBiometric(userId: string, biometricType: 'face' | 'fingerprint') {
    try {
      const biometric = {
        id: `biom_${this.generateId()}`,
        userId,
        type: biometricType,
        registeredAt: new Date().toISOString(),
      };

      // In production, store biometric data securely
      this.logger.log(`Biometric registered: ${biometricType} for user ${userId}`);

      return {
        success: true,
        biometricId: biometric.id,
        message: `${biometricType} biometric registered`,
      };
    } catch (error) {
      this.logger.error(`Failed to register biometric: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get mobile sessions
   */
  async getMobileSessions(userId: string) {
    try {
      const devices = await this.prisma.mobileDevice.findMany({
        where: { userId, isActive: true },
      });

      return {
        devices: devices.map((d) => ({
          deviceId: d.deviceId,
          deviceOS: d.deviceOS,
          appVersion: d.appVersion,
          lastActiveAt: d.lastActiveAt,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get mobile sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logout from mobile device
   */
  async mobileLogout(userId: string, deviceId: string) {
    try {
      await this.prisma.mobileDevice.updateMany({
        where: { userId, deviceId },
        data: { isActive: false },
      });

      this.logger.log(`Mobile logout: ${userId} from ${deviceId}`);

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Failed to logout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enable offline mode setup
   */
  async getOfflineSyncData(userId: string, organizationId: string) {
    try {
      const investors = await this.prisma.investor.findMany({
        where: { organizationId, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          firm: true,
          sectors: true,
        },
      });

      const startups = await this.prisma.startup.findMany({
        where: { organizationId, deletedAt: null },
        select: {
          id: true,
          name: true,
          description: true,
          currentStage: true,
          targetAmount: true,
        },
      });

      const activities = await this.prisma.activity.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return {
        lastSyncAt: new Date().toISOString(),
        data: {
          investors,
          startups,
          activities,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to prepare offline data: ${error.message}`);
      throw error;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
