import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowExecutionsService {
  private readonly logger = new Logger(WorkflowExecutionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async startExecution(workflowId: string, leadId?: string, initialContext?: Record<string, any>) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found`);
    }

    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        leadId,
        status: 'running',
        context: initialContext ? (initialContext as any) : {},
        nodeResults: {},
      },
    });

    this.logger.log(`Started execution ${execution.id} for workflow ${workflowId}`);
    
    // In a real system, we would publish an event or start async processing here
    // For now, we return the execution record
    return execution;
  }

  async stopExecution(executionId: string) {
    return this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed', // Or stopped
        completedAt: new Date(),
      },
    });
  }

  async pauseExecution(executionId: string) {
    return this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'paused',
      },
    });
  }

  async findAllForWorkflow(workflowId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      include: { lead: { select: { name: true } } },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  async findOne(id: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id },
      include: { workflow: { select: { name: true } } },
    });
    if (!execution) throw new NotFoundException('Execution not found');
    return execution;
  }
}
