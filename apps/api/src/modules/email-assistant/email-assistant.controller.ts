import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailAssistantService } from './email-assistant.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/ai/email-assistant')
@UseGuards(JwtGuard)
export class EmailAssistantController {
  constructor(private emailAssistantService: EmailAssistantService) {}

  @Post('draft')
  @HttpCode(HttpStatus.OK)
  async generateDraft(
    @Request() req: any,
    @Body() { investorId, startupId, context }: any,
  ) {
    return this.emailAssistantService.generateEmailDraft(
      req.user.organizationId,
      investorId,
      startupId,
      context,
    );
  }

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  async optimizeEmail(
    @Request() req: any,
    @Body() { emailContent, investorId }: any,
  ) {
    return this.emailAssistantService.optimizeEmail(
      req.user.organizationId,
      emailContent,
      investorId,
    );
  }

  @Get('templates')
  async getTemplates(@Request() req: any) {
    return this.emailAssistantService.getTemplates(req.user.organizationId);
  }
}
