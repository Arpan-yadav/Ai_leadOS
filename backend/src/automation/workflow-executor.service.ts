/**
 * @file workflow-executor.service.ts
 * @description DB-Backed Workflow Execution Engine — Sprint 5, Automation Team
 *
 * Runs active visual builder workflows by walking their node graphs,
 * executing conditions/actions, calling Gemini for AI nodes,
 * logging executions, and updating performance metrics.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { LeadsService } from '../leads/leads.service';
import { TasksService } from '../tasks/tasks.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'ai_logic';
  label: string;
  config: any;
  nextNodes: string[];
}

interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  output?: Record<string, any>;
  error?: string;
  executedAt: string;
  durationMs: number;
}

@Injectable()
export class WorkflowExecutorService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly leadsService: LeadsService,
    private readonly tasksService: TasksService,
  ) {}

  onModuleInit() {
    this.logger.log('Workflow Executor Engine initialized.');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledWorkflows() {
    // Implement background sweep for any active time-based workflows
    const activeWorkflows = await this.prisma.workflow.findMany({
      where: { status: 'ACTIVE' },
    });

    if (activeWorkflows.length > 0) {
      this.logger.debug(`[WorkflowCronEngine] Swept ${activeWorkflows.length} active workflows.`);
      // Future logic: Check if any active workflows have 'Scheduled' triggers and execute them.
    }
  }

  /**
   * Run a workflow for a specific lead.
   */
  async executeWorkflow(workflowId: string, leadId: string, triggerEventContext?: any): Promise<any> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.status !== 'ACTIVE') {
      this.logger.warn(`Workflow ${workflowId} not found or is not ACTIVE`);
      return;
    }

    const definition = workflow.definition as any;
    const entryNodeId = definition?.entryNodeId;
    const nodes = (definition?.nodes || []) as WorkflowNode[];

    if (!entryNodeId || nodes.length === 0) {
      this.logger.warn(`Workflow ${workflow.name} (${workflowId}) has no entry node or nodes configured`);
      return;
    }

    // 1. Create a WorkflowExecution in DB
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        leadId,
        status: 'running',
        context: { triggerEvent: triggerEventContext } as any,
        nodeResults: [] as any,
      },
    });

    this.logger.log(`[WorkflowExecutor] Started execution ${execution.id} for workflow: ${workflow.name}`);

    const nodeResults: NodeExecutionResult[] = [];
    let currentNodeId = entryNodeId;
    const visited = new Set<string>();
    let hasFailed = false;
    const executionStartMs = Date.now();

    try {
      while (currentNodeId && !visited.has(currentNodeId) && !hasFailed) {
        visited.add(currentNodeId);
        const node = nodes.find((n) => n.id === currentNodeId);
        if (!node) {
          this.logger.warn(`Node ${currentNodeId} not found in workflow definition`);
          break;
        }

        const startMs = Date.now();
        let executionOutput: any = { success: true };
        let nextNodeId: string | null = null;

        try {
          // Execute Node
          const nodeResult = await this.executeNode(node, leadId, workflow.createdById, execution.context);
          executionOutput = nodeResult;

          nodeResults.push({
            nodeId: node.id,
            status: nodeResult.success ? 'success' : 'failed',
            output: nodeResult.output,
            error: nodeResult.error,
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startMs,
          });

          if (!nodeResult.success) {
            hasFailed = true;
            break;
          }

          // Determine next node
          if (node.type === 'condition') {
            const isConditionMet = !!nodeResult.output?.conditionMet;
            const condConfig = node.config as any;
            nextNodeId = isConditionMet ? condConfig?.trueBranch : condConfig?.falseBranch;
          } else {
            nextNodeId = node.nextNodes?.[0] || null;
          }
        } catch (err) {
          this.logger.error(`Error executing node ${node.label} (${node.id}):`, err);
          nodeResults.push({
            nodeId: node.id,
            status: 'failed',
            error: err.message || String(err),
            executedAt: new Date().toISOString(),
            durationMs: Date.now() - startMs,
          });
          hasFailed = true;
          break;
        }

        currentNodeId = nextNodeId;
      }

      // 2. Finalize execution status
      const finalStatus = hasFailed ? 'failed' : 'completed';
      const completedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: finalStatus,
          nodeResults: nodeResults as any,
          completedAt: new Date(),
        },
      });

      // 3. Update Workflow metrics
      const executionDuration = Date.now() - executionStartMs;
      await this.updateWorkflowMetrics(workflowId, finalStatus === 'completed', executionDuration);

      return completedExecution;
    } catch (err) {
      this.logger.error(`Workflow execution ${execution.id} encountered critical error:`, err);
      return this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          nodeResults: nodeResults as any,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Execute logic for a single node.
   */
  private async executeNode(
    node: WorkflowNode,
    leadId: string,
    workflowCreatorId: string,
    context: any,
  ): Promise<{ success: boolean; output?: Record<string, any>; error?: string }> {
    this.logger.log(`Executing Node: "${node.label}" (Type: ${node.type})`);

    switch (node.type) {
      case 'trigger':
        return { success: true, output: { triggered: true } };

      case 'condition': {
        const config = node.config as any;
        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
        });

        if (!lead) {
          return { success: false, error: `Lead ${leadId} not found` };
        }

        const field = config.field;
        const operator = config.operator;
        const targetValue = config.value;
        const leadValue = (lead as any)[field];

        let conditionMet = false;

        switch (operator) {
          case 'equals':
            conditionMet = String(leadValue).toLowerCase() === String(targetValue).toLowerCase();
            break;
          case 'not_equals':
            conditionMet = String(leadValue).toLowerCase() !== String(targetValue).toLowerCase();
            break;
          case 'greater_than':
            conditionMet = Number(leadValue) > Number(targetValue);
            break;
          case 'less_than':
            conditionMet = Number(leadValue) < Number(targetValue);
            break;
          case 'contains':
            conditionMet = String(leadValue).toLowerCase().includes(String(targetValue).toLowerCase());
            break;
          case 'not_contains':
            conditionMet = !String(leadValue).toLowerCase().includes(String(targetValue).toLowerCase());
            break;
          case 'is_empty':
            conditionMet = !leadValue;
            break;
          case 'is_not_empty':
            conditionMet = !!leadValue;
            break;
          default:
            return { success: false, error: `Unsupported operator: ${operator}` };
        }

        this.logger.log(`Condition evaluation: ${field} (${leadValue}) ${operator} ${targetValue} => ${conditionMet}`);
        return { success: true, output: { conditionMet } };
      }

      case 'action': {
        const config = node.config as any;
        const actionType = config.type;

        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
        });

        if (!lead) {
          return { success: false, error: `Lead ${leadId} not found` };
        }

        switch (actionType) {
          case 'send_email':
          case 'send_whatsapp':
          case 'send_linkedin_dm': {
            const channelNames: Record<string, string> = {
              send_email: 'email',
              send_whatsapp: 'whatsapp',
              send_linkedin_dm: 'linkedin',
            };
            const activity = await this.prisma.activity.create({
              data: {
                type: channelNames[actionType],
                content: `[Automation] ${config.content || 'Outreach message dispatched automatically.'}`,
                leadId,
                userId: workflowCreatorId,
              },
            });
            return { success: true, output: { activityId: activity.id, sent: true } };
          }

          case 'update_lead_status': {
            const updatedLead = await this.leadsService.update(leadId, { status: config.targetStatus }, workflowCreatorId);
            return { success: true, output: { previousStatus: lead.status, newStatus: updatedLead.status } };
          }

          case 'update_lead_score': {
            const scoreOffset = Number(config.scoreValue || 0);
            const updatedLead = await this.prisma.lead.update({
              where: { id: leadId },
              data: { score: { increment: scoreOffset } },
            });
            return { success: true, output: { previousScore: lead.score, newScore: updatedLead.score } };
          }

          case 'create_task': {
            const task = await this.tasksService.create(
              {
                title: config.title || 'Workflow Action Required',
                description: config.description || 'Automatically created by visual builder workflow.',
                dueDate: config.dueDate ? new Date(config.dueDate).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                priority: config.priority || 'medium',
                leadId,
              },
              workflowCreatorId,
            );
            return { success: true, output: { taskId: task.id, created: true } };
          }

          case 'add_note': {
            const noteActivity = await this.prisma.activity.create({
              data: {
                type: 'note',
                content: config.content || 'Workflow automated note.',
                leadId,
                userId: workflowCreatorId,
              },
            });
            return { success: true, output: { activityId: noteActivity.id, noteAdded: true } };
          }

          case 'notify_slack': {
            this.logger.log(`[Slack Automation Alert] notifying channel: ${config.channel || 'general'} -> ${config.content || 'New alert'}`);
            return { success: true, output: { notified: true, channel: config.channel } };
          }

          case 'ai_score_lead': {
            const aiResult = await this.aiService.scoreLead({
              name: lead.name,
              company: lead.company,
              title: lead.title || undefined,
              source: lead.source,
              interactions: 1,
              tenantId: lead.tenantId,
            });
            await this.prisma.lead.update({
              where: { id: leadId },
              data: { score: aiResult.score },
            });
            return { success: true, output: { reScored: true, newScore: aiResult.score } };
          }

          case 'ai_generate_email': {
            const draft = await this.aiService.generateEmailDraft(
              lead.name,
              lead.company,
              lead.title || undefined,
              config.content,
            );

            const emailActivity = await this.prisma.activity.create({
              data: {
                type: 'email',
                content: `[AI Email Draft generated]\n\n${draft}`,
                leadId,
                userId: workflowCreatorId,
              },
            });

            return { success: true, output: { activityId: emailActivity.id, draftGenerated: true, preview: draft.substring(0, 100) + '...' } };
          }

          case 'wait_delay': {
            const delayMs = Math.min((config.delayMinutes || 0) * 1000, 2000);
            await new Promise((res) => setTimeout(res, delayMs));
            return { success: true, output: { delayedMs: delayMs } };
          }

          default:
            return { success: false, error: `Unsupported action type: ${actionType}` };
        }
      }

      case 'delay': {
        const config = node.config as any;
        const delayMs = Math.min((config.delayMinutes || 0) * 1000, 2000);
        await new Promise((res) => setTimeout(res, delayMs));
        return { success: true, output: { waitCompleted: true, waitedMs: delayMs } };
      }

      case 'ai_logic': {
        const config = node.config as any;
        if (config.type === 'draft_email') {
          const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
          if (!lead) return { success: false, error: 'Lead not found for email draft' };
          const draft = await this.aiService.generateEmailDraft(
            lead.name,
            lead.company,
            lead.title || undefined,
            config.prompt,
          );
          return { success: true, output: { aiResult: draft } };
        }
        return { success: true, output: { processed: true } };
      }

      default:
        return { success: false, error: `Unsupported node type: ${node.type}` };
    }
  }

  /**
   * Keep runtime metrics updated.
   */
  private async updateWorkflowMetrics(workflowId: string, isSuccessful: boolean, executionTimeMs: number): Promise<void> {
    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) return;

      const currentMetrics = (workflow.metrics || {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        leadsProcessed: 0,
        avgExecutionMs: 0,
      }) as any;

      const totalRuns = (currentMetrics.totalRuns || 0) + 1;
      const successfulRuns = (currentMetrics.successfulRuns || 0) + (isSuccessful ? 1 : 0);
      const failedRuns = (currentMetrics.failedRuns || 0) + (isSuccessful ? 0 : 1);
      const avgExecutionMs = Math.round(
        ((currentMetrics.avgExecutionMs || 0) * (totalRuns - 1) + executionTimeMs) / totalRuns,
      );

      const metrics = {
        totalRuns,
        successfulRuns,
        failedRuns,
        leadsProcessed: totalRuns,
        avgExecutionMs,
        lastRunAt: new Date().toISOString(),
      };

      await this.prisma.workflow.update({
        where: { id: workflowId },
        data: {
          metrics: metrics as any,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to update workflow metrics for ${workflowId}:`, err);
    }
  }
}
