import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StartupProfilesService } from './startup-profiles.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/startup-profiles')
export class StartupProfilesController {
  constructor(private startupProfilesService: StartupProfilesService) {}

  @Get('public')
  async listPublicProfiles(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('industry') industry?: string,
    @Query('stage') stage?: string,
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.startupProfilesService.listPublicProfiles(skip, parseInt(pageSize), {
      industry,
      stage,
    });
  }

  @Get('public/search')
  async searchPublicProfiles(
    @Query('q') query: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    if (!query || query.length < 2) {
      return { startups: [], total: 0 };
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.startupProfilesService.searchProfiles(query, skip, parseInt(pageSize));
  }

  @Get('public/:startupId')
  async getPublicProfile(@Param('startupId') startupId: string) {
    return this.startupProfilesService.getPublicProfile(startupId);
  }

  @Get(':startupId')
  @UseGuards(JwtGuard)
  async getFullProfile(@Request() req: any, @Param('startupId') startupId: string) {
    return this.startupProfilesService.getFullProfile(req.user.organizationId, startupId);
  }

  @Get(':startupId/metrics')
  @UseGuards(JwtGuard)
  async getMetrics(@Request() req: any, @Param('startupId') startupId: string) {
    return this.startupProfilesService.getMetrics(req.user.organizationId, startupId);
  }

  @Get(':startupId/founders')
  @UseGuards(JwtGuard)
  async getFounders(@Request() req: any, @Param('startupId') startupId: string) {
    return this.startupProfilesService.getFounders(req.user.organizationId, startupId);
  }

  @Put(':startupId')
  @UseGuards(JwtGuard)
  async updateProfile(
    @Request() req: any,
    @Param('startupId') startupId: string,
    @Body() updateData: any,
  ) {
    return this.startupProfilesService.updateProfile(
      req.user.organizationId,
      startupId,
      updateData,
    );
  }

  @Put(':startupId/visibility')
  @UseGuards(JwtGuard)
  async setVisibility(
    @Request() req: any,
    @Param('startupId') startupId: string,
    @Body() { visibility }: { visibility: 'public' | 'private' | 'anonymous' },
  ) {
    return this.startupProfilesService.setVisibility(
      req.user.organizationId,
      startupId,
      visibility,
    );
  }

  @Post(':startupId/founders')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async addFounder(
    @Request() req: any,
    @Param('startupId') startupId: string,
    @Body() founder: any,
  ) {
    return this.startupProfilesService.addFounder(
      req.user.organizationId,
      startupId,
      founder,
    );
  }
}
