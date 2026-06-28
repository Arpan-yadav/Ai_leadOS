/**
 * @file leads.module.ts
 * @description Leads Module — Sprint 2, Backend + AI Team
 *
 * Imports AiModule so LeadsService can auto-score new leads.
 * EventBusService is globally provided by EventsModule (no import needed).
 */

import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [LeadsService],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
