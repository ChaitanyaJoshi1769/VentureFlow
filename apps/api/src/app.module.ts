import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { InvestorsModule } from './modules/investors/investors.module';
import { StartupsModule } from './modules/startups/startups.module';
import { CrmModule } from './modules/crm/crm.module';
import { PitchDecksModule } from './modules/pitch-decks/pitch-decks.module';
import { EmailCampaignsModule } from './modules/email-campaigns/email-campaigns.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { NotesModule } from './modules/notes/notes.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WarmIntroModule } from './modules/warm-intro-graph/warm-intro.module';
import { DataRoomModule } from './modules/data-room/data-room.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AiCopilotModule } from './modules/ai-copilot/ai-copilot.module';
import { StartupProfilesModule } from './modules/startup-profiles/startup-profiles.module';
import { InvestorPortalModule } from './modules/investor-portal/investor-portal.module';
import { AiMatchingModule } from './modules/ai-matching/ai-matching.module';
import { PitchAnalyzerModule } from './modules/pitch-analyzer/pitch-analyzer.module';
import { EmailAssistantModule } from './modules/email-assistant/email-assistant.module';
import { DdAnalyzerModule } from './modules/dd-analyzer/dd-analyzer.module';
import { ValuationModule } from './modules/valuation/valuation.module';
import { FounderMatchingModule } from './modules/founder-matching/founder-matching.module';
import { SlackIntegrationModule } from './modules/slack-integration/slack-integration.module';
import { StripeIntegrationModule } from './modules/stripe-integration/stripe-integration.module';
import { GmailSyncModule } from './modules/gmail-sync/gmail-sync.module';
import { SalesforceSyncModule } from './modules/salesforce-sync/salesforce-sync.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AdvancedAnalyticsModule } from './modules/advanced-analytics/advanced-analytics.module';
import { BillingModule } from './modules/billing/billing.module';
import { WebSocketModule } from './modules/websocket-gateway/websocket.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { MobileAuthModule } from './modules/mobile-auth/mobile-auth.module';
import { PrismaService } from './common/services/prisma.service';

const logger = new Logger('AppModule');

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      introspection: process.env.NODE_ENV !== 'production',
      plugins: [],
    }),

    // Feature Modules - Phase 2 Core
    AuthModule,
    InvestorsModule,
    StartupsModule,
    CrmModule,

    // Feature Modules - Phase 3 Advanced
    PitchDecksModule,
    EmailCampaignsModule,
    ActivitiesModule,
    NotesModule,
    AnalyticsModule,
    WarmIntroModule,
    DataRoomModule,
    NotificationsModule,
    TasksModule,

    // Feature Modules - Phase 4 AI Features
    EmailAssistantModule,
    DdAnalyzerModule,
    ValuationModule,
    FounderMatchingModule,

    // Feature Modules - Phase 5 & 6 Intelligence & Portals
    AiCopilotModule,
    StartupProfilesModule,
    InvestorPortalModule,
    AiMatchingModule,
    PitchAnalyzerModule,

    // Feature Modules - Phase 5 Integrations
    SlackIntegrationModule,
    StripeIntegrationModule,
    GmailSyncModule,
    SalesforceSyncModule,

    // Feature Modules - Phase 6 Admin & Analytics
    AdminDashboardModule,
    AdvancedAnalyticsModule,
    BillingModule,

    // Feature Modules - Phase 7 Real-Time & Mobile
    WebSocketModule,
    PushNotificationsModule,
    MobileAuthModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  constructor(private prisma: PrismaService) {
    logger.log('VentureFlow AI Backend initialized with 32/32 core modules (Phase 2-7) - PRODUCTION READY');
  }
}
