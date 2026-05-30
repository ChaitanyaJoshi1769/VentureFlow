import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DdAnalyzerService } from './dd-analyzer.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/ai/dd-analyzer')
@UseGuards(JwtGuard)
export class DdAnalyzerController {
  constructor(private ddAnalyzerService: DdAnalyzerService) {}

  @Get('startup/:startupId')
  async analyzeStartup(@Request() req: any, @Param('startupId') startupId: string) {
    return this.ddAnalyzerService.analyzeStartup(req.user.organizationId, startupId);
  }

  @Post('compare')
  async compareStartups(
    @Request() req: any,
    @Body() { startupIds }: { startupIds: string[] },
  ) {
    return this.ddAnalyzerService.compareStartups(req.user.organizationId, startupIds);
  }

  @Get('checklist/:startupId')
  async getChecklist(@Param('startupId') startupId: string) {
    return this.ddAnalyzerService.getChecklist(startupId);
  }
}
