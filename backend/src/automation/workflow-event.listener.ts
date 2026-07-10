/**
 * @file workflow-event.listener.ts
 * @description Event-driven trigger loader for workflows — Sprint 5, Automation Team
 *
 * Subscribes to CRM events on the global EventBus and triggers
 * active DB-backed workflows that match trigger configs.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { WorkflowExecutorService } from './workflow-executor.service';

@Injectable()
export class WorkflowEventListener implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
    private readonly workflowExecutor: WorkflowExecutorService,
  ) {}

  onModuleInit(): void {
    this.registerListeners();
  }

  private registerListeners(): void {
    // 1. Lead Created
    this.eventBus.on('lead.created', async (payload) => {
      this.logger.debug(`[WorkflowEventListener] Received lead.created for lead ${payload.leadId}`);
      await this.triggerWorkflowsByEvent('lead_created', payload.leadId, payload, (config) => {
        return true; // No extra filters for simple creation trigger
      });
    });

    // 2. Lead Status Changed
    this.eventBus.on('lead.status_changed', async (payload) => {
      this.logger.debug(`[WorkflowEventListener] Received lead.status_changed for lead ${payload.leadId}`);
      await this.triggerWorkflowsByEvent('lead_status_changed', payload.leadId, payload, (config) => {
        if (!config.targetStatus) return true; // Triggers on any status change if empty
        return String(payload.newStatus).toLowerCase() === String(config.targetStatus).toLowerCase();
      });
    });

    // 3. Lead Scored (translates to lead_score_threshold trigger)
    this.eventBus.on('lead.scored', async (payload) => {
      this.logger.debug(`[WorkflowEventListener] Received lead.scored for lead ${payload.leadId}`);
      await this.triggerWorkflowsByEvent('lead_score_threshold', payload.leadId, payload, (config) => {
        if (!config.scoreThreshold) return true;
        return Number(payload.score) >= Number(config.scoreThreshold);
      });
    });

    // 4. Task Completed
    this.eventBus.on('task.completed', async (payload) => {
      if (!payload.leadId) return;
      this.logger.debug(`[WorkflowEventListener] Received task.completed for lead ${payload.leadId}`);
      await this.triggerWorkflowsByEvent('task_completed', payload.leadId, payload, (config) => {
        return true;
      });
    });

    this.logger.log('[WorkflowEventListener] Registered handlers for lead.created, lead.status_changed, lead.scored, task.completed');
  }

  /**
   * Look up and run all active workflows matching the given trigger type and condition.
   */
  private async triggerWorkflowsByEvent(
    triggerType: string,
    leadId: string,
    eventPayload: any,
    conditionFilter: (config: any) => boolean,
  ): Promise<void> {
    try {
      // Find all active workflows
      const activeWorkflows = await this.prisma.workflow.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const workflow of activeWorkflows) {
        const definition = workflow.definition as any;
        const entryNodeId = definition?.entryNodeId;
        const nodes = definition?.nodes || [];

        // Find the trigger node
        const triggerNode = nodes.find((n: any) => n.id === entryNodeId && n.type === 'trigger');
        if (!triggerNode) continue;

        const config = triggerNode.config as any;
        if (config?.type === triggerType) {
          // Evaluate target filters (e.g., status match, score threshold)
          if (conditionFilter(config)) {
            this.logger.log(
              `⚡ Workflow "${workflow.name}" matches trigger ${triggerType} for lead ${leadId}. Launching execution...`,
            );

            // Execute workflow asynchronously in background
            this.workflowExecutor.executeWorkflow(workflow.id, leadId, eventPayload).catch((err) => {
              this.logger.error(`Error executing workflow ${workflow.name} (${workflow.id}):`, err);
            });
          }
        }
      }
    } catch (err) {
      this.logger.error(`Failed to trigger workflows for trigger type ${triggerType}:`, err);
    }
  }
}
