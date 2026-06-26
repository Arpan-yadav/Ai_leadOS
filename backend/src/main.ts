/**
 * @file main.ts
 * @description NestJS Application Entry Point
 * Sprint 1 — Backend Team Deliverable
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ─── Global Validation Pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: false,
      transform: true,           // Auto-transform payloads to DTO types
    }),
  );

  // ─── API Prefix ────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Swagger Docs ──────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI LeadOS API')
    .setDescription('AI-powered Lead Management & Sales Automation API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Leads', 'Lead management')
    .addTag('AI', 'AI intelligence endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);

  console.log(`\n🚀 AI LeadOS Backend running at: http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs:               http://localhost:${PORT}/api/docs\n`);
}

bootstrap();
