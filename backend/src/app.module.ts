/**
 * @file app.module.ts
 * @description Root Application Module
 * Sprint 1 — Backend Team Deliverable
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // ─── Config (environment variables) ──────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Core Modules ─────────────────────────────────────────────
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
