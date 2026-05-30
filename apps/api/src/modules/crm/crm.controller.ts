import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CreateCrmInvestorDto, UpdateCrmInvestorDto } from './dto';

@Controller('api/v1/crm')
@UseGuards(JwtGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  /**
   * POST /api/v1/crm/investors
   * Add investor to startup pipeline
   */
  @Post('investors')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createCrmDto: CreateCrmInvestorDto) {
    return this.crmService.create(req.user.organizationId, createCrmDto);
  }

  /**
   * GET /api/v1/crm/investors
   * Get all CRM records with pagination
   */
  @Get('investors')
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.crmService.findAll(req.user.organizationId, skip, parseInt(pageSize));
  }

  /**
   * GET /api/v1/crm/investors/:id
   * Get single CRM record
   */
  @Get('investors/:id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.crmService.findOne(req.user.organizationId, id);
  }

  /**
   * PUT /api/v1/crm/investors/:id
   * Update CRM record
   */
  @Put('investors/:id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCrmDto: UpdateCrmInvestorDto,
  ) {
    return this.crmService.update(req.user.organizationId, id, updateCrmDto);
  }

  /**
   * DELETE /api/v1/crm/investors/:id
   * Delete CRM record
   */
  @Delete('investors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.crmService.delete(req.user.organizationId, id);
  }

  /**
   * GET /api/v1/crm/startups/:startupId/investors
   * Get investors for specific startup
   */
  @Get('startups/:startupId/investors')
  async findByStartup(
    @Request() req: any,
    @Param('startupId') startupId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.crmService.findByStartup(
      req.user.organizationId,
      startupId,
      skip,
      parseInt(pageSize),
    );
  }

  /**
   * PUT /api/v1/crm/investors/:id/stage
   * Move investor to different pipeline stage
   */
  @Put('investors/:id/stage')
  async moveStage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { stage }: { stage: string },
  ) {
    return this.crmService.moveStage(req.user.organizationId, id, stage);
  }

  /**
   * GET /api/v1/crm/pipeline/stats
   * Get pipeline statistics
   */
  @Get('pipeline/stats')
  async getPipelineStats(
    @Request() req: any,
    @Query('startupId') startupId?: string,
  ) {
    return this.crmService.getPipelineStats(req.user.organizationId, startupId);
  }

  /**
   * GET /api/v1/crm/stage/:stage
   * Get investors in specific stage
   */
  @Get('stage/:stage')
  async findByStage(
    @Request() req: any,
    @Param('stage') stage: string,
    @Query('startupId') startupId?: string,
  ) {
    return this.crmService.findByStage(req.user.organizationId, stage, startupId);
  }

  /**
   * POST /api/v1/crm/bulk-update
   * Bulk update multiple CRM records
   */
  @Post('bulk-update')
  async bulkUpdate(
    @Request() req: any,
    @Body() { crmIds, updates }: { crmIds: string[]; updates: Record<string, any> },
  ) {
    return this.crmService.bulkUpdate(req.user.organizationId, crmIds, updates);
  }

  /**
   * GET /api/v1/crm/follow-ups
   * Get upcoming follow-ups
   */
  @Get('follow-ups')
  async getUpcomingFollowUps(
    @Request() req: any,
    @Query('days') days = '7',
  ) {
    return this.crmService.getUpcomingFollowUps(req.user.organizationId, parseInt(days));
  }
}
