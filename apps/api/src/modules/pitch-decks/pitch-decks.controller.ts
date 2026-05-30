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
import { PitchDecksService } from './pitch-decks.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CreatePitchDeckDto, UpdatePitchDeckDto } from './dto';

@Controller('api/v1/decks')
@UseGuards(JwtGuard)
export class PitchDecksController {
  constructor(private pitchDecksService: PitchDecksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body() { startupId, ...createPitchDeckDto }: CreatePitchDeckDto & { startupId: string },
  ) {
    return this.pitchDecksService.create(req.user.organizationId, startupId, createPitchDeckDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('startupId') startupId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    return this.pitchDecksService.findByStartup(
      req.user.organizationId,
      startupId,
      skip,
      parseInt(pageSize),
    );
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.pitchDecksService.findOne(req.user.organizationId, id);
  }

  @Get(':id/analytics')
  async getAnalytics(@Request() req: any, @Param('id') id: string) {
    return this.pitchDecksService.getAnalytics(req.user.organizationId, id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updatePitchDeckDto: UpdatePitchDeckDto,
  ) {
    return this.pitchDecksService.update(req.user.organizationId, id, updatePitchDeckDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.pitchDecksService.delete(req.user.organizationId, id);
  }

  @Post(':id/share')
  async generateShareLink(
    @Request() req: any,
    @Param('id') id: string,
    @Body() { expiresInDays }: { expiresInDays?: number },
  ) {
    return this.pitchDecksService.generateShareLink(
      req.user.organizationId,
      id,
      expiresInDays,
    );
  }

  @Post(':id/publish')
  async publish(@Request() req: any, @Param('id') id: string) {
    return this.pitchDecksService.publish(req.user.organizationId, id);
  }

  @Post(':id/archive')
  async archive(@Request() req: any, @Param('id') id: string) {
    return this.pitchDecksService.archive(req.user.organizationId, id);
  }
}

// Public route (no auth required)
@Controller('api/v1/deck/:token/viewer')
export class PitchDeckViewerController {
  constructor(private pitchDecksService: PitchDecksService) {}

  @Get()
  async viewDeck(
    @Param('token') token: string,
    @Query('email') email?: string,
    @Query('investor') investorId?: string,
  ) {
    return this.pitchDecksService.recordView(token, email, investorId);
  }
}
