/**
 * @file automation.module.ts
 * @description NestJS Automation Module — Sprint 2, Automation Team
 *
 * Houses all automation listeners and orchestrators.
 * The visual workflow engine (Sprint 5) will be added here.
 */

import { Module } from '@nestjs/common';
import { AutoScoreListener } from './auto-score.listener';

@Module({
  providers: [AutoScoreListener],
  exports: [AutoScoreListener],
})
export class AutomationModule {}
