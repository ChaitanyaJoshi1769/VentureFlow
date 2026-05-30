import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiCopilotService } from './ai-copilot.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';

@Controller('api/v1/ai')
@UseGuards(JwtGuard)
export class AiCopilotController {
  constructor(private aiCopilotService: AiCopilotService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Request() req: any,
    @Body() { startupId }: { startupId?: string },
  ) {
    return this.aiCopilotService.getOrCreateConversation(
      req.user.organizationId,
      req.user.id,
      startupId,
    );
  }

  @Get('conversations')
  async listConversations(@Request() req: any) {
    return this.aiCopilotService.listConversations(
      req.user.organizationId,
      req.user.id,
    );
  }

  @Get('conversations/:conversationId')
  async getConversation(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.aiCopilotService.getConversationHistory(
      req.user.organizationId,
      conversationId,
    );
  }

  @Post('conversations/:conversationId/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
    @Body() { message }: { message: string },
  ) {
    return this.aiCopilotService.sendMessage(
      req.user.organizationId,
      conversationId,
      message,
    );
  }

  @Get('startups/:startupId/recommendations')
  async getInvestorRecommendations(
    @Request() req: any,
    @Param('startupId') startupId: string,
  ) {
    return this.aiCopilotService.getInvestorRecommendations(
      req.user.organizationId,
      startupId,
    );
  }

  @Get('startups/:startupId/pitch-analysis')
  async analyzePitchDeck(
    @Request() req: any,
    @Param('startupId') startupId: string,
  ) {
    return this.aiCopilotService.analyzePitchDeck(
      req.user.organizationId,
      startupId,
    );
  }

  @Get('startups/:startupId/fundraising-strategy')
  async getFundraisingStrategy(
    @Request() req: any,
    @Param('startupId') startupId: string,
  ) {
    return this.aiCopilotService.generateFundraisingStrategy(
      req.user.organizationId,
      startupId,
    );
  }
}
