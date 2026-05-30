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
import { InvestorsService } from './investors.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CreateInvestorDto, UpdateInvestorDto, SearchInvestorDto } from './dto';

@Controller('api/v1/investors')
@UseGuards(JwtGuard)
export class InvestorsController {
  constructor(private investorsService: InvestorsService) {}

  /**
   * POST /api/v1/investors
   * Create a new investor record
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createInvestorDto: CreateInvestorDto) {
    return this.investorsService.create(req.user.organizationId, createInvestorDto);
  }

  /**
   * GET /api/v1/investors
   * List all investors with pagination
   */
  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.investorsService.findAll(
      req.user.organizationId,
      skip,
      parseInt(pageSize),
    );
  }

  /**
   * GET /api/v1/investors/search
   * Advanced investor search
   */
  @Get('search')
  async search(@Request() req: any, @Query() searchDto: SearchInvestorDto) {
    return this.investorsService.search(req.user.organizationId, searchDto);
  }

  /**
   * GET /api/v1/investors/by-sector/:sector
   * Get investors by sector
   */
  @Get('by-sector/:sector')
  async findBySector(@Request() req: any, @Param('sector') sector: string) {
    return this.investorsService.findBySector(req.user.organizationId, sector);
  }

  /**
   * GET /api/v1/investors/by-stage/:stage
   * Get investors by funding stage
   */
  @Get('by-stage/:stage')
  async findByStage(@Request() req: any, @Param('stage') stage: string) {
    return this.investorsService.findByStage(req.user.organizationId, stage);
  }

  /**
   * GET /api/v1/investors/by-geography
   * Get investors by geographic criteria
   */
  @Get('by-geography')
  async findByGeography(
    @Request() req: any,
    @Query('country') country?: string,
    @Query('state') state?: string,
  ) {
    return this.investorsService.findByGeography(req.user.organizationId, country, state);
  }

  /**
   * GET /api/v1/investors/:id
   * Get single investor details
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.investorsService.findOne(req.user.organizationId, id);
  }

  /**
   * GET /api/v1/investors/:id/portfolio
   * Get investor portfolio
   */
  @Get(':id/portfolio')
  async getPortfolio(@Request() req: any, @Param('id') id: string) {
    return this.investorsService.getPortfolio(req.user.organizationId, id);
  }

  /**
   * PUT /api/v1/investors/:id
   * Update investor
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateInvestorDto: UpdateInvestorDto,
  ) {
    return this.investorsService.update(req.user.organizationId, id, updateInvestorDto);
  }

  /**
   * DELETE /api/v1/investors/:id
   * Delete investor
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.investorsService.delete(req.user.organizationId, id);
  }

  /**
   * POST /api/v1/investors/import
   * Import investors from external source
   */
  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  async import(@Request() req: any, @Body() { investors }: { investors: CreateInvestorDto[] }) {
    return this.investorsService.importInvestors(req.user.organizationId, investors);
  }

  /**
   * POST /api/v1/investors/bulk-update
   * Bulk update multiple investors
   */
  @Post('bulk-update')
  async bulkUpdate(
    @Request() req: any,
    @Body() { investorIds, updates }: { investorIds: string[]; updates: Record<string, any> },
  ) {
    return this.investorsService.bulkUpdate(
      req.user.organizationId,
      investorIds,
      updates,
    );
  }
}
