import { Controller, Get, Put, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/admin')
@UseGuards(JwtGuard)
export class AdminDashboardController {
  constructor(private adminService: AdminDashboardService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.adminService.getDashboardOverview(req.user.organizationId, req.user.id);
  }

  @Get('users')
  async listUsers(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.adminService.listUsers(req.user.organizationId, req.user.id, page, pageSize);
  }

  @Put('users/:userId/role')
  async updateUserRole(
    @Request() req: any,
    @Param('userId') userId: string,
    @Body() { role }: any,
  ) {
    return this.adminService.updateUserRole(req.user.organizationId, req.user.id, userId, role);
  }

  @Post('users/:userId/disable')
  async disableUser(@Request() req: any, @Param('userId') userId: string) {
    return this.adminService.disableUser(req.user.organizationId, req.user.id, userId);
  }

  @Get('settings')
  async getSettings(@Request() req: any) {
    return this.adminService.getOrganizationSettings(req.user.organizationId, req.user.id);
  }

  @Put('settings')
  async updateSettings(@Request() req: any, @Body() settings: any) {
    return this.adminService.updateOrganizationSettings(req.user.organizationId, req.user.id, settings);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.adminService.getAuditLogs(req.user.organizationId, req.user.id, page, pageSize);
  }

  @Post('export')
  async exportData(@Request() req: any, @Body() { format }: any) {
    return this.adminService.exportOrganizationData(req.user.organizationId, req.user.id, format);
  }
}
