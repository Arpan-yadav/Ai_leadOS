/**
 * @file events.module.ts
 * @description NestJS Events Module — Sprint 2, Automation Team
 *
 * Provides the typed EventBusService globally to all modules.
 */

import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventsModule {}
