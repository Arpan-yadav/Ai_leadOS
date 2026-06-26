/**
 * @module automation/engine
 * @description In-memory Automation Engine (Sprint 1 stub)
 * Sprint 1 — Automation Team Deliverable
 * 
 * This is a client-side stub of the automation engine.
 * In production (Sprint 3+), this will run server-side with
 * persistent queues and DB-backed state.
 */

import type {
  Workflow,
  WorkflowExecution,
  WorkflowNode,
  ActionConfig,
  TriggerConfig,
} from './schemas/workflowSchema';
import type { Sequence, SequenceEnrollment } from './schemas/sequenceSchema';
import type { Event, EventType, EventHandler } from './schemas/eventSchema';

// ─── Event Bus (In-Memory) ────────────────────────────────────────────────────

type HandlerMap = Map<string, { types: EventType[]; handler: EventHandler }>;

class InMemoryEventBus {
  private handlers: HandlerMap = new Map();
  private eventLog: Event[] = [];

  emit<T>(event: Event<T>): void {
    this.eventLog.push(event as Event);
    console.info(`[EventBus] Emitting ${event.type} for entity ${event.entityId}`);
    
    this.handlers.forEach(({ types, handler }) => {
      if (types.includes(event.type)) {
        handler.handle(event as Event).catch((err) => {
          console.error(`[EventBus] Handler "${handler.name}" failed:`, err);
        });
      }
    });
  }

  on<T>(types: EventType[], handler: EventHandler<T>): void {
    this.handlers.set(handler.name, { types, handler: handler as EventHandler });
    console.info(`[EventBus] Handler "${handler.name}" registered for: ${types.join(', ')}`);
  }

  off(handlerName: string): void {
    this.handlers.delete(handlerName);
  }

  getEventLog(): Event[] {
    return [...this.eventLog];
  }

  clearLog(): void {
    this.eventLog = [];
  }
}

// ─── Automation Engine ────────────────────────────────────────────────────────

class AutomationEngine {
  private eventBus = new InMemoryEventBus();
  private workflows: Map<string, Workflow> = new Map();
  private sequences: Map<string, Sequence> = new Map();
  private executions: WorkflowExecution[] = [];
  private enrollments: SequenceEnrollment[] = [];

  // ─── Workflow Registry ──────────────────────────────────────────────

  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    
    if (workflow.status === 'active') {
      this.activateWorkflowListeners(workflow);
    }
    
    console.info(`[AutomationEngine] Workflow "${workflow.name}" registered`);
  }

  private activateWorkflowListeners(workflow: Workflow): void {
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) return;

    const config = triggerNode.config as TriggerConfig;

    const eventTypeMap: Record<string, EventType> = {
      lead_created: 'lead.created',
      lead_status_changed: 'lead.status_changed',
      lead_score_threshold: 'lead.score_updated',
      message_received: 'email.replied',
      task_completed: 'task.completed',
      deal_stage_changed: 'deal.stage_changed',
    };

    const eventType = eventTypeMap[config.type];
    if (!eventType) return;

    this.eventBus.on([eventType], {
      name: `workflow_${workflow.id}_listener`,
      listensTo: [eventType],
      description: `Listener for workflow: ${workflow.name}`,
      handle: async (event: Event<Record<string, unknown>>) => {
        await this.executeWorkflow(workflow.id, event.entityId, event as Event);
      },
    });
  }

  async executeWorkflow(
    workflowId: string,
    leadId: string,
    triggerEvent?: Event,
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId,
      leadId,
      status: 'running',
      startedAt: new Date().toISOString(),
      nodeResults: [],
      context: { triggerEvent },
    };

    this.executions.push(execution);
    console.info(`[AutomationEngine] Executing workflow "${workflow.name}" for lead ${leadId}`);

    try {
      // Walk the node graph starting from entry node
      let currentNodeId = workflow.entryNodeId;
      const visited = new Set<string>();

      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const node = workflow.nodes.find(n => n.id === currentNodeId);
        if (!node) break;

        const startMs = Date.now();
        const result = await this.executeNode(node, execution.context);
        
        execution.nodeResults.push({
          nodeId: node.id,
          status: result.success ? 'success' : 'failed',
          output: result.output,
          error: result.error,
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - startMs,
        });

        // Move to next node (take first next node for now — branching in Sprint 3)
        currentNodeId = node.nextNodes[0] || '';
      }

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
    } catch (err) {
      execution.status = 'failed';
      execution.completedAt = new Date().toISOString();
    }

    return execution;
  }

  private async executeNode(
    node: WorkflowNode,
    context: Record<string, unknown>,
  ): Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }> {
    console.info(`[AutomationEngine] Executing node: ${node.label} (${node.type})`);

    switch (node.type) {
      case 'trigger':
        return { success: true, output: { triggered: true } };
      
      case 'action': {
        const config = node.config as ActionConfig;
        // Stub execution — real integration in Sprint 3
        console.info(`[AutomationEngine] Action: ${config.type}`);
        return { success: true, output: { action: config.type, executed: true } };
      }

      case 'delay': {
        const config = node.config as ActionConfig;
        console.info(`[AutomationEngine] Delay: ${config.delayMinutes} minutes (stubbed)`);
        return { success: true, output: { delayed: true } };
      }

      case 'condition':
        // Condition evaluation — full logic in Sprint 3
        return { success: true, output: { conditionMet: true } };

      case 'ai_logic':
        return { success: true, output: { aiProcessed: true } };

      default:
        return { success: false, error: `Unknown node type: ${node.type}` };
    }
  }

  // ─── Sequence Registry ──────────────────────────────────────────────

  registerSequence(sequence: Sequence): void {
    this.sequences.set(sequence.id, sequence);
    console.info(`[AutomationEngine] Sequence "${sequence.name}" registered`);
  }

  enrollLeadInSequence(sequenceId: string, leadId: string): SequenceEnrollment {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);

    const enrollment: SequenceEnrollment = {
      id: `enr_${Date.now()}`,
      sequenceId,
      leadId,
      status: 'active',
      currentStepNumber: 1,
      enrolledAt: new Date().toISOString(),
      nextStepAt: new Date(Date.now() + (sequence.steps[0]?.delayHours || 0) * 3600000).toISOString(),
      stepHistory: [],
    };

    this.enrollments.push(enrollment);
    console.info(`[AutomationEngine] Lead ${leadId} enrolled in sequence "${sequence.name}"`);
    return enrollment;
  }

  // ─── Event Bus Proxy ────────────────────────────────────────────────

  get bus(): InMemoryEventBus {
    return this.eventBus;
  }

  // ─── Analytics ─────────────────────────────────────────────────────

  getStats() {
    return {
      workflows: this.workflows.size,
      sequences: this.sequences.size,
      executions: this.executions.length,
      enrollments: this.enrollments.length,
      eventLog: this.eventBus.getEventLog().length,
    };
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const automationEngine = new AutomationEngine();
export default automationEngine;
