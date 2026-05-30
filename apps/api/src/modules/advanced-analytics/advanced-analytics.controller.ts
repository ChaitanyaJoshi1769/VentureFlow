import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/analytics/advanced')
@UseGuards(JwtGuard)
export class AdvancedAnalyticsController {
  constructor(private analyticsService: AdvancedAnalyticsService) {}

  @Get('dashboard')
  async getCustomDashboard(@Request() req: any, @Query('filters') filters?: any) {
    return this.analyticsService.getCustomDashboard(req.user.organizationId, filters);
  }

  @Post('report')
  async generateReport(
    @Request() req: any,
    @Body() { reportType, filters }: any,
  ) {
    return this.analyticsService.generateCustomReport(req.user.organizationId, reportType, filters);
  }

  @Get('timeseries')
  async getTimeSeriesMetrics(
    @Request() req: any,
    @Query('metricType') metricType: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.analyticsService.getTimeSeriesMetrics(
      req.user.organizationId,
      metricType as any,
      { start: new Date(start), end: new Date(end) },
    );
  }

  @Get('cohort')
  async getCohortAnalysis(
    @Request() req: any,
    @Query('cohortType') cohortType: string,
  ) {
    return this.analyticsService.getCohortAnalysis(req.user.organizationId, cohortType as any);
  }

  @Get('segments')
  async getSegmentAnalysis(
    @Request() req: any,
    @Query('segmentBy') segmentBy: string,
  ) {
    return this.analyticsService.getSegmentAnalysis(req.user.organizationId, segmentBy as any);
  }
}
