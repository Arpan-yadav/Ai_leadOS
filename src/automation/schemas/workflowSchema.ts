/**
 * @module automation/schemas/workflowSchema
 * @description Workflow Engine Schema Definitions
 * Sprint 1 — Automation Team Deliverable
 * 
 * Defines the complete type system and data structures for the
 * AI LeadOS automation engine. These schemas power the visual
 * workflow builder and the event-driven execution engine.
 */

// ─── Enums & Constants ────────────────────────────────────────────────────────

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';
export type NodeType = 'trigger' | 'condition' | 'action' | 'delay' | 'ai_logic';
export type TriggerType =
  | 'lead_created'
  | 'lead_status_changed'
  | 'lead_score_threshold'
  | 'message_received'
  | 'task_completed'
  | 'deal_stage_changed'
  | 'schedule_cron'
  | 'webhook';

export type ActionType =
  | 'send_email'
  | 'send_whatsapp'
  | 'send_linkedin_dm'
  | 'update_lead_status'
  | 'update_lead_score'
  | 'create_task'
  | 'add_note'
  | 'notify_slack'
  | 'ai_score_lead'
  | 'ai_generate_email'
  | 'wait_delay';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

// ─── Node Definitions ─────────────────────────────────────────────────────────

export interface WorkflowNodePosition {
  x: number;
  y: number;
}

export interface TriggerConfig {
  type: TriggerType;
  /** For schedule_cron: cron expression */
  cronExpression?: string;
  /** For lead_score_threshold: the threshold value */
  scoreThreshold?: number;
  /** For lead_status_changed: the target status */
  targetStatus?: string;
  /** For webhook: the event name */
  webhookEvent?: string;
}

export interface ConditionConfig {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  /** Branch label for 'true' path */
  trueBranch?: string;
  /** Branch label for 'false' path */
  falseBranch?: string;
}

export interface ActionConfig {
  type: ActionType;
  /** Template ID or raw content for message actions */
  templateId?: string;
  content?: string;
  /** For delay actions: duration in minutes */
  delayMinutes?: number;
  /** Key-value pairs for field updates */
  fields?: Record<string, string | number | boolean>;
  /** For AI actions: the prompt key from PROMPT_REGISTRY */
  promptKey?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: WorkflowNodePosition;
  config: TriggerConfig | ConditionConfig | ActionConfig;
  /** IDs of downstream nodes */
  nextNodes: string[];
}

// ─── Workflow Definition ──────────────────────────────────────────────────────

export interface WorkflowTag {
  label: string;
  color: string;
}

export interface WorkflowMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  leadsProcessed: number;
  lastRunAt?: string;
  avgExecutionMs?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  tags: WorkflowTag[];
  /** The root trigger node ID */
  entryNodeId: string;
  nodes: WorkflowNode[];
  /** Adjacency map: nodeId -> nextNodeIds */
  edges: Record<string, string[]>;
  metrics: WorkflowMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  /** Whether this workflow uses AI decision nodes */
  hasAINodes: boolean;
}

// ─── Workflow Execution ───────────────────────────────────────────────────────

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'paused';

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  output?: Record<string, unknown>;
  error?: string;
  executedAt: string;
  durationMs: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  leadId?: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  nodeResults: NodeExecutionResult[];
  context: Record<string, unknown>;
}

// ─── Factory Functions ────────────────────────────────────────────────────────

/** Creates a new empty Workflow with defaults */
export function createWorkflow(
  partial: Partial<Workflow> & { name: string; createdBy: string }
): Workflow {
  const now = new Date().toISOString();
  return {
    id: `wf_${Date.now()}`,
    name: partial.name,
    description: partial.description || '',
    status: 'draft',
    tags: partial.tags || [],
    entryNodeId: partial.entryNodeId || '',
    nodes: partial.nodes || [],
    edges: partial.edges || {},
    metrics: {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      leadsProcessed: 0,
    },
    createdAt: now,
    updatedAt: now,
    createdBy: partial.createdBy,
    hasAINodes: partial.hasAINodes ?? false,
  };
}

/** Creates a trigger node */
export function createTriggerNode(
  id: string,
  config: TriggerConfig,
  position: WorkflowNodePosition = { x: 0, y: 0 }
): WorkflowNode {
  const labels: Record<TriggerType, string> = {
    lead_created: 'Lead Created',
    lead_status_changed: 'Status Changed',
    lead_score_threshold: 'Score Threshold',
    message_received: 'Message Received',
    task_completed: 'Task Completed',
    deal_stage_changed: 'Deal Stage Changed',
    schedule_cron: 'Scheduled',
    webhook: 'Webhook',
  };
  return {
    id,
    type: 'trigger',
    label: labels[config.type] || 'Trigger',
    position,
    config,
    nextNodes: [],
  };
}

/** Creates an action node */
export function createActionNode(
  id: string,
  config: ActionConfig,
  position: WorkflowNodePosition = { x: 0, y: 0 }
): WorkflowNode {
  const labels: Record<ActionType, string> = {
    send_email: 'Send Email',
    send_whatsapp: 'WhatsApp Message',
    send_linkedin_dm: 'LinkedIn DM',
    update_lead_status: 'Update Status',
    update_lead_score: 'Update Score',
    create_task: 'Create Task',
    add_note: 'Add Note',
    notify_slack: 'Slack Alert',
    ai_score_lead: 'AI Score Lead',
    ai_generate_email: 'AI Draft Email',
    wait_delay: 'Wait / Delay',
  };
  return {
    id,
    type: 'action',
    label: labels[config.type] || 'Action',
    position,
    config,
    nextNodes: [],
  };
}

// ─── Workflow Templates ───────────────────────────────────────────────────────

/**
 * Built-in workflow templates for quick-start.
 */
export const WORKFLOW_TEMPLATES: Partial<Workflow>[] = [
  {
    name: 'Hot Lead Alert',
    description: 'Instantly notify the sales team when a lead scores above 80.',
    status: 'active',
    tags: [{ label: 'AI', color: 'bg-brand-100 text-brand-700' }],
    hasAINodes: true,
  },
  {
    name: 'New Lead Welcome Sequence',
    description: 'Automatically trigger a welcome email + WhatsApp for every new lead.',
    status: 'active',
    tags: [{ label: 'Outreach', color: 'bg-emerald-100 text-emerald-700' }],
    hasAINodes: false,
  },
  {
    name: 'Cold Lead Re-engagement',
    description: 'Re-activate leads with no activity in 14 days.',
    status: 'draft',
    tags: [{ label: 'Nurture', color: 'bg-amber-100 text-amber-700' }],
    hasAINodes: true,
  },
  {
    name: 'Post-Demo Follow-up',
    description: 'Automated follow-up sequence after a demo meeting is marked complete.',
    status: 'draft',
    tags: [{ label: 'Pipeline', color: 'bg-blue-100 text-blue-700' }],
    hasAINodes: true,
  },
];
