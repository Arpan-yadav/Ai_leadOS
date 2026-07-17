/**
 * @file app.module.ts
 * @description Root Application Module
 * Sprint 1 — Backend Team Deliverable
 * Sprint 2 — AI + Automation modules added (Arpan)
 * Sprint 3 — Tasks + Activities modules
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { AiModule } from './ai/ai.module';
import { AutomationModule } from './automation/automation.module';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivitiesModule } from './activities/activities.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SequencesModule } from './sequences/sequences.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { WorkflowExecutionsModule } from './workflow-executions/workflow-executions.module';
import { CommunicationsModule } from './communications/communications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // ─── Config (environment variables) ──────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Core Modules ─────────────────────────────────────────────
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per IP per minute
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,

    // ─── Sprint 2, 3, 4, 5 Modules ──────────────────────────────
    EventsModule,      // Global event bus (available everywhere)
    AiModule,          // Gemini AI service
    AutomationModule,  // Event listeners and workflow engine
    LeadsModule,       // Lead CRUD + AI auto-scoring
    DealsModule,       // Deal pipeline
    TasksModule,       // Sprint 3 Task Management
    ActivitiesModule,  // Sprint 3 Activity Timeline
    DashboardModule,   // Aggregated stats
    SequencesModule,
    AiInsightsModule,
    WebhooksModule,
    WorkflowsModule,
    WorkflowExecutionsModule,
    CommunicationsModule,
    AnalyticsModule,
    SettingsModule,    // Sprint 6 — BYOK tenant settings
    AdminModule,       // Sprint 7 — Admin user management
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}