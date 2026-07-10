import { Module } from '@nestjs/common';
import { AutoScoreListener } from './auto-score.listener';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { WorkflowExecutionsModule } from '../workflow-executions/workflow-executions.module';
import { AutomationEngineService } from './automation-engine.service';
import { LeadsModule } from '../leads/leads.module';
import { TasksModule } from '../tasks/tasks.module';
import { WorkflowExecutorService } from './workflow-executor.service';
import { WorkflowEventListener } from './workflow-event.listener';
import { AutomationController } from './automation.controller';

@Module({
  imports: [PrismaModule, AiModule, WorkflowExecutionsModule, LeadsModule, TasksModule],
  controllers: [AutomationController],
  providers: [AutoScoreListener, AutomationEngineService, WorkflowExecutorService, WorkflowEventListener],
  exports: [AutoScoreListener, AutomationEngineService, WorkflowExecutorService, WorkflowEventListener],
})
export class AutomationModule {}

