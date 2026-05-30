import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'verbose', 'warn'],
  });

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VentureFlow AI API')
      .setDescription('The operating system for startup fundraising')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('http://localhost:4000', 'Development')
      .addServer('https://api.ventureflow.io', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Health check
  app.get('/health', () => ({ status: 'ok' }));

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Server is running on http://localhost:${port}`);
  logger.log(`📚 API documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
