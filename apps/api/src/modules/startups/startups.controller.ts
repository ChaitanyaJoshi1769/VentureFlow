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
import { StartupsService } from './startups.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CreateStartupDto, UpdateStartupDto } from './dto';

@Controller('api/v1/startups')
@UseGuards(JwtGuard)
export class StartupsController {
  constructor(private startupsService: StartupsService) {}

  /**
   * POST /api/v1/startups
   * Create a new startup profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createStartupDto: CreateStartupDto) {
    return this.startupsService.create(req.user.organizationId, createStartupDto);
  }

  /**
   * GET /api/v1/startups
   * List all startups with pagination
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.startupsService.findAll(
      req.user.organizationId,
      skip,
      parseInt(pageSize),
    );
  }

  /**
   * GET /api/v1/startups/search
   * Search startups
   */
  @Get('search')
  async search(
    @Request() req: any,
    @Query('q') query: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.startupsService.search(
      req.user.organizationId,
      query,
      skip,
      parseInt(pageSize),
    );
  }

  /**
   * GET /api/v1/startups/by-stage/:stage
   * Get startups by stage
   */
  @Get('by-stage/:stage')
  async findByStage(@Request() req: any, @Param('stage') stage: string) {
    return this.startupsService.findByStage(req.user.organizationId, stage);
  }

  /**
   * GET /api/v1/startups/by-industry/:industry
   * Get startups by industry
   */
  @Get('by-industry/:industry')
  async findByIndustry(@Request() req: any, @Param('industry') industry: string) {
    return this.startupsService.findByIndustry(req.user.organizationId, industry);
  }

  /**
   * GET /api/v1/startups/:id
   * Get single startup details
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.startupsService.findOne(req.user.organizationId, id);
  }

  /**
   * GET /api/v1/startups/:id/crm
   * Get startup CRM pipeline
   */
  @Get(':id/crm')
  async getCRM(@Request() req: any, @Param('id') id: string) {
    return this.startupsService.getCRM(req.user.organizationId, id);
  }

  /**
   * PUT /api/v1/startups/:id
   * Update startup
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateStartupDto: UpdateStartupDto,
  ) {
    return this.startupsService.update(req.user.organizationId, id, updateStartupDto);
  }

  /**
   * DELETE /api/v1/startups/:id
   * Delete startup
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.startupsService.delete(req.user.organizationId, id);
  }
}
