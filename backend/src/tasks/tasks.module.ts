/**
 * @file tasks.module.ts
 * @description Tasks Module — Sprint 3
 *
 * Handles task CRUD operations and task management.
 */

import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}