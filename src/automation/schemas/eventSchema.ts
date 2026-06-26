/**
 * @module automation/schemas/eventSchema
 * @description Event Architecture Schema Definitions
 * Sprint 1 — Automation Team Deliverable
 * 
 * The Event System is the backbone of the AI LeadOS automation engine.
 * All user actions, AI decisions, and system changes emit events that
 * can trigger workflows and sequences.
 */

// ─── Event Categories ──────────────────────────────────────────────────────────

export type EventCategory = 
  | 'crm'         // Lead, Deal, Contact changes
  | 'communication' // Email, WhatsApp, LinkedIn events
  | 'ai'          // AI analysis and scoring events
  | 'automation'  // Workflow and sequence events
  | 'system'      // System-level events
  | 'user';       // User-initiated actions

// ─── CRM Events ──────────────────────────────────────────────────────────────

export type CRMEventType =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.deleted'
  | 'lead.status_changed'
  | 'lead.score_updated'
  | 'lead.assigned'
  | 'lead.converted'
  | 'deal.created'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'task.created'
  | 'task.completed'
  | 'task.overdue'
  | 'note.added';

// ─── Communication Events ────────────────────────────────────────────────────

export type CommunicationEventType =
  | 'email.sent'
  | 'email.opened'
  | 'email.clicked'
  | 'email.replied'
  | 'email.bounced'
  | 'whatsapp.sent'
  | 'whatsapp.delivered'
  | 'whatsapp.read'
  | 'whatsapp.replied'
  | 'linkedin.connection_accepted'
  | 'linkedin.message_replied';

// ─── AI Events ───────────────────────────────────────────────────────────────

export type AIEventType =
  | 'ai.lead_scored'
  | 'ai.company_analyzed'
  | 'ai.sequence_generated'
  | 'ai.workflow_suggested'
  | 'ai.email_drafted'
  | 'ai.lead_qualified'
  | 'ai.lead_disqualified';

// ─── Automation Events ────────────────────────────────────────────────────────

export type AutomationEventType =
  | 'workflow.triggered'
  | 'workflow.step_completed'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'sequence.lead_enrolled'
  | 'sequence.step_sent'
  | 'sequence.lead_exited'
  | 'sequence.completed';

// ─── All Event Types ──────────────────────────────────────────────────────────

export type EventType =
  | CRMEventType
  | CommunicationEventType
  | AIEventType
  | AutomationEventType;

// ─── Event Interface ──────────────────────────────────────────────────────────

export interface EventMetadata {
  /** Source system that emitted this event */
  source: 'crm' | 'email_gateway' | 'whatsapp_gateway' | 'ai_engine' | 'automation_engine' | 'user_action';
  /** IP address or user agent for user-initiated events */
  clientInfo?: string;
  /** Retry count if this event was reprocessed */
  retryCount?: number;
  /** Whether this event was replayed from dead-letter queue */
  isReplay?: boolean;
}

export interface Event<TPayload = Record<string, unknown>> {
  /** Unique event ID */
  id: string;
  /** Event type following namespace.action pattern */
  type: EventType;
  /** Event category for routing */
  category: EventCategory;
  /** The ID of the primary entity this event is about */
  entityId: string;
  /** Entity type: 'lead', 'deal', 'workflow', etc. */
  entityType: string;
  /** The user who caused this event (undefined for system events) */
  userId?: string;
  /** Organization/tenant ID */
  orgId: string;
  /** Event payload - varies by event type */
  payload: TPayload;
  /** Event metadata */
  meta: EventMetadata;
  /** ISO timestamp of event creation */
  timestamp: string;
  /** Whether this event has been processed */
  processed: boolean;
  /** ISO timestamp of processing */
  processedAt?: string;
}

// ─── Typed Event Payloads ─────────────────────────────────────────────────────

export interface LeadCreatedPayload {
  leadId: string;
  name: string;
  email: string;
  company: string;
  source: string;
  initialScore?: number;
}

export interface LeadStatusChangedPayload {
  leadId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
}

export interface LeadScoreUpdatedPayload {
  leadId: string;
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  reason: string;
  triggeredBy: 'ai' | 'manual' | 'automation';
}

export interface EmailEventPayload {
  leadId: string;
  sequenceId?: string;
  stepId?: string;
  messageId: string;
  subject?: string;
  timestamp: string;
}

export interface AILeadScoredPayload {
  leadId: string;
  score: number;
  reason: string;
  model: string;
  promptKey: string;
  durationMs: number;
}

// ─── Event Handler Interface ──────────────────────────────────────────────────

export interface EventHandler<TPayload = Record<string, unknown>> {
  /** Unique handler name */
  name: string;
  /** Which event types this handler listens to */
  listensTo: EventType[];
  /** Handler description */
  description: string;
  /** Handler function */
  handle: (event: Event<TPayload>) => Promise<void>;
}

// ─── Event Bus Interface ──────────────────────────────────────────────────────

export interface EventBus {
  /** Emit an event */
  emit<T>(event: Omit<Event<T>, 'id' | 'timestamp' | 'processed'>): void;
  /** Subscribe to event types */
  on<T>(types: EventType[], handler: EventHandler<T>): void;
  /** Unsubscribe a handler */
  off(handlerName: string): void;
}

// ─── Factory Functions ────────────────────────────────────────────────────────

export function createEvent<TPayload>(
  partial: Omit<Event<TPayload>, 'id' | 'timestamp' | 'processed'>
): Event<TPayload> {
  return {
    ...partial,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    processed: false,
  };
}

// ─── Event Category Mapping ───────────────────────────────────────────────────

export function getEventCategory(type: EventType): EventCategory {
  if (type.startsWith('lead.') || type.startsWith('deal.') || type.startsWith('task.') || type.startsWith('note.')) {
    return 'crm';
  }
  if (type.startsWith('email.') || type.startsWith('whatsapp.') || type.startsWith('linkedin.')) {
    return 'communication';
  }
  if (type.startsWith('ai.')) {
    return 'ai';
  }
  if (type.startsWith('workflow.') || type.startsWith('sequence.')) {
    return 'automation';
  }
  return 'system';
}
