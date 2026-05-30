import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

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

    // Database
    // TypeOrmModule configuration will go here
    // For now, we'll use Prisma instead of TypeORM

    // Core modules
    // Import feature modules here
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
