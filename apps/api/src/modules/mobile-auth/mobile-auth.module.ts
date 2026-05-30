import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MobileAuthService } from './mobile-auth.service';
import { MobileAuthController } from './mobile-auth.controller';
import { PrismaService } from '@/common/services/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [MobileAuthController],
  providers: [MobileAuthService, PrismaService],
  exports: [MobileAuthService],
})
export class MobileAuthModule {}
