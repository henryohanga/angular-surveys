import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/common/filters/http-exception.filter';
import { SanitizePipe } from './app/common/pipes/sanitize.pipe';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Security: Helmet middleware for HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Enable CORS with configurable origins
  const corsOrigins = process.env['CORS_ORIGIN']?.split(',') || [
    'http://localhost:4200',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400, // 24 hours
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global pipes: sanitization + validation
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env['NODE_ENV'] === 'production',
    })
  );

  // Swagger documentation (disabled in production)
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Angular Surveys API')
      .setDescription('The Angular Surveys API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('surveys', 'Survey management endpoints')
      .addTag('responses', 'Survey response endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env['PORT'] || 3000;
  await app.listen(port);

  logger.log(`🚀 API is running on: http://localhost:${port}/api`);
  if (process.env['NODE_ENV'] !== 'production') {
    logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
