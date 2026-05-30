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
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  constructor(private prisma: PrismaService) {
    logger.log('VentureFlow AI Backend initialized with 9 core modules');
  }
}
