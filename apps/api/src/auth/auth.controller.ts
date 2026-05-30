import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/signup
   * Create a new user account
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;

    if (!email || !password || !firstName || !lastName) {
      throw new BadRequestException('Missing required fields');
    }

    return this.authService.signUp(email, password, firstName, lastName);
  }

  /**
   * POST /api/v1/auth/login
   * Sign in with email and password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password required');
    }

    return this.authService.signIn(email, password);
  }

  /**
   * POST /api/v1/auth/magic-link/request
   * Request a magic link for passwordless login
   */
  @Post('magic-link/request')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() magicLinkDto: MagicLinkDto) {
    const { email } = magicLinkDto;

    if (!email) {
      throw new BadRequestException('Email required');
    }

    return this.authService.generateMagicLink(email);
  }

  /**
   * POST /api/v1/auth/magic-link/verify
   * Verify magic link and sign in
   */
  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(@Body() body: { email: string; token: string }) {
    const { email, token } = body;

    if (!email || !token) {
      throw new BadRequestException('Email and token required');
    }

    return this.authService.verifyMagicLink(email, token);
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token required');
    }

    return this.authService.refreshToken(refreshToken);
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user (revoke tokens)
   */
  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    // In production, add token to blacklist
    return { message: 'Logged out successfully' };
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtGuard)
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    const { email } = body;

    if (!email) {
      throw new BadRequestException('Email required');
    }

    return this.authService.requestPasswordReset(email);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password required');
    }

    return this.authService.resetPassword(token, newPassword);
  }

  /**
   * GET /api/v1/auth/oauth/google
   * Initiate Google OAuth
   */
  @Get('oauth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google will redirect to callback
  }

  /**
   * GET /api/v1/auth/oauth/google/callback
   * Google OAuth callback
   */
  @Get('oauth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req: any) {
    return this.authService.handleOAuthCallback('google', req.user);
  }

  /**
   * GET /api/v1/auth/oauth/microsoft
   * Initiate Microsoft OAuth
   */
  @Get('oauth/microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {
    // Microsoft will redirect to callback
  }

  /**
   * GET /api/v1/auth/oauth/microsoft/callback
   * Microsoft OAuth callback
   */
  @Get('oauth/microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback(@Request() req: any) {
    return this.authService.handleOAuthCallback('microsoft', req.user);
  }

  /**
   * GET /api/v1/auth/oauth/linkedin
   * Initiate LinkedIn OAuth
   */
  @Get('oauth/linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {
    // LinkedIn will redirect to callback
  }

  /**
   * GET /api/v1/auth/oauth/linkedin/callback
   * LinkedIn OAuth callback
   */
  @Get('oauth/linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback(@Request() req: any) {
    return this.authService.handleOAuthCallback('linkedin', req.user);
  }

  /**
   * GET /api/v1/auth/oauth/github
   * Initiate GitHub OAuth
   */
  @Get('oauth/github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // GitHub will redirect to callback
  }

  /**
   * GET /api/v1/auth/oauth/github/callback
   * GitHub OAuth callback
   */
  @Get('oauth/github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Request() req: any) {
    return this.authService.handleOAuthCallback('github', req.user);
  }

  /**
   * POST /api/v1/auth/verify-email
   * Verify email with token
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { token: string }) {
    const { token } = body;

    if (!token) {
      throw new BadRequestException('Token required');
    }

    return this.authService.verifyEmail(token);
  }

  /**
   * POST /api/v1/auth/totp/enable
   * Enable two-factor authentication
   */
  @Post('totp/enable')
  @UseGuards(JwtGuard)
  async enableTOTP(@Request() req: any) {
    return this.authService.enableTOTP(req.user.id);
  }

  /**
   * POST /api/v1/auth/totp/verify
   * Verify TOTP code
   */
  @Post('totp/verify')
  @UseGuards(JwtGuard)
  async verifyTOTP(@Request() req: any, @Body() body: { code: string }) {
    const { code } = body;

    if (!code) {
      throw new BadRequestException('TOTP code required');
    }

    const verified = await this.authService.verifyTOTP(req.user.id, code);

    if (!verified) {
      throw new BadRequestException('Invalid TOTP code');
    }

    return { message: 'TOTP verified successfully' };
  }
}
