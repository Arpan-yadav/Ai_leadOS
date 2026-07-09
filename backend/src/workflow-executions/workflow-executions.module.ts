import { Module } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowExecutionsController } from './workflow-executions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowExecutionsController],
  providers: [WorkflowExecutionsService],
  exports: [WorkflowExecutionsService],
})
export class WorkflowExecutionsModule {}
