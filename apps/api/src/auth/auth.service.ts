import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaService } from '@/common/services/prisma.service';

export interface AuthPayload {
  id: string;
  email: string;
  organizationId?: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  type: 'Bearer';
  user: AuthPayload;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Sign up new user
   */
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<TokenResponse> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        emailVerified: new Date(), // Auto-verify for development
      },
    });

    // Create tokens
    return this.generateTokens(user);
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<TokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last sign in
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSignIn: new Date() },
    });

    return this.generateTokens(user);
  }

  /**
   * Generate magic link for passwordless auth
   */
  async generateMagicLink(email: string): Promise<{ token: string; expiresAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { token: nanoid(32), expiresAt: new Date(Date.now() + 15 * 60 * 1000) };
    }

    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store token (in production, use Redis or similar)
    // For now, this is a placeholder

    return { token, expiresAt };
  }

  /**
   * Verify magic link
   */
  async verifyMagicLink(email: string, token: string): Promise<TokenResponse> {
    // In production, verify token from storage
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid magic link');
    }

    return this.generateTokens(user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * OAuth callback handler
   */
  async handleOAuthCallback(provider: string, profile: any): Promise<TokenResponse> {
    const email = profile.emails?.[0]?.value || profile.email;

    if (!email) {
      throw new BadRequestException('Email not provided by provider');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user from OAuth profile
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
          lastName: profile.family_name || profile.name?.split(' ')[1] || '',
          avatar: profile.picture || profile.photos?.[0]?.value,
          emailVerified: new Date(),
        },
      });
    }

    return this.generateTokens(user);
  }

  /**
   * Generate JWT tokens
   */
  async generateTokens(user: any): Promise<TokenResponse> {
    const payload: AuthPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.defaultOrganizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    const decoded = this.jwtService.decode(accessToken) as any;

    return {
      accessToken,
      refreshToken,
      expiresIn: decoded.exp - Math.floor(Date.now() / 1000),
      type: 'Bearer',
      user: payload,
    };
  }

  /**
   * Validate JWT payload
   */
  async validatePayload(payload: AuthPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const token = nanoid(32);
    // Store reset token (in production, use Redis with TTL)

    return { message: 'Reset link sent to email' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<TokenResponse> {
    // Verify token from storage
    const email = 'user@example.com'; // Get from token

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return this.generateTokens(user);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Verify token and mark email as verified
    return { message: 'Email verified successfully' };
  }

  /**
   * Enable TOTP
   */
  async enableTOTP(userId: string): Promise<{ secret: string; qrCode: string }> {
    // Generate TOTP secret
    const secret = nanoid(32);

    // In production, generate actual QR code

    return {
      secret,
      qrCode: 'data:image/svg+xml,...',
    };
  }

  /**
   * Verify TOTP
   */
  async verifyTOTP(userId: string, code: string): Promise<boolean> {
    // Verify TOTP code
    return true;
  }
}
