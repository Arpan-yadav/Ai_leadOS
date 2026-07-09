import { Module } from '@nestjs/common';
import { AutoScoreListener } from './auto-score.listener';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { WorkflowExecutionsModule } from '../workflow-executions/workflow-executions.module';
import { AutomationEngineService } from './automation-engine.service';

@Module({
  imports: [PrismaModule, AiModule, WorkflowExecutionsModule],
  providers: [AutoScoreListener, AutomationEngineService],
  exports: [AutoScoreListener, AutomationEngineService],
})
export class AutomationModule {}

