import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvestorPortalService } from './investor-portal.service';

@Controller('api/v1/investor-portal')
export class InvestorPortalController {
  constructor(private investorPortalService: InvestorPortalService) {}

  @Get(':investorId/dashboard')
  async getDashboard(@Param('investorId') investorId: string) {
    return this.investorPortalService.getInvestorDashboard(investorId);
  }

  @Get(':investorId/history')
  async getInteractionHistory(@Param('investorId') investorId: string) {
    return this.investorPortalService.getInteractionHistory(investorId);
  }

  @Get(':investorId/search')
  async searchStartups(
    @Param('investorId') investorId: string,
    @Query('q') query: string,
    @Query('sector') sector?: string,
    @Query('stage') stage?: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.investorPortalService.searchStartups(investorId, query, {
      sector,
      stage,
    });
  }

  @Get(':investorId/recommendations')
  async getRecommendations(@Param('investorId') investorId: string) {
    return this.investorPortalService.getRecommendedStartups(investorId);
  }

  @Get(':investorId/watchlist')
  async getWatchlist(@Param('investorId') investorId: string) {
    return this.investorPortalService.getWatchlist(investorId);
  }

  @Post(':investorId/watchlist/:startupId')
  @HttpCode(HttpStatus.CREATED)
  async saveToWatchlist(
    @Param('investorId') investorId: string,
    @Param('startupId') startupId: string,
  ) {
    return this.investorPortalService.saveToWatchlist(investorId, startupId);
  }

  @Delete(':investorId/watchlist/:startupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWatchlist(
    @Param('investorId') investorId: string,
    @Param('startupId') startupId: string,
  ) {
    return this.investorPortalService.removeFromWatchlist(investorId, startupId);
  }

  @Post(':investorId/startups/:startupId/request-intro')
  @HttpCode(HttpStatus.CREATED)
  async requestIntroduction(
    @Param('investorId') investorId: string,
    @Param('startupId') startupId: string,
    @Body() { message }: { message?: string },
  ) {
    return this.investorPortalService.requestIntroduction(
      investorId,
      startupId,
      message,
    );
  }

  @Post(':investorId/startups/:startupId/rate')
  @HttpCode(HttpStatus.CREATED)
  async rateStartup(
    @Param('investorId') investorId: string,
    @Param('startupId') startupId: string,
    @Body() { rating, review }: { rating: number; review?: string },
  ) {
    return this.investorPortalService.rateStartup(investorId, startupId, rating, review);
  }

  @Post(':investorId/startups/:startupId/request-deck')
  @HttpCode(HttpStatus.CREATED)
  async requestPitchDeck(
    @Param('investorId') investorId: string,
    @Param('startupId') startupId: string,
  ) {
    return this.investorPortalService.requestPitchDeck(investorId, startupId);
  }

  @Get(':investorId/portfolio')
  async getPortfolio(@Param('investorId') investorId: string) {
    return this.investorPortalService.getPortfolioView(investorId);
  }
}
