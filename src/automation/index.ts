/**
 * @module automation/index
 * @description Automation Module Public API
 * Sprint 1 — Automation Team Deliverable
 */

export { automationEngine, default as AutomationEngine } from './engine';

export type {
  Workflow,
  WorkflowStatus,
  WorkflowNode,
  NodeType,
  TriggerType,
  ActionType,
  TriggerConfig,
  ActionConfig,
  ConditionConfig,
  WorkflowExecution,
  WorkflowMetrics,
} from './schemas/workflowSchema';
export {
  createWorkflow,
  createTriggerNode,
  createActionNode,
  WORKFLOW_TEMPLATES,
} from './schemas/workflowSchema';

export type {
  Sequence,
  SequenceStep,
  SequenceStatus,
  StepChannel,
  EnrollmentTrigger,
  SequenceEnrollment,
  EnrollmentStatus,
} from './schemas/sequenceSchema';
export {
  createSequence,
  createSequenceStep,
  SEQUENCE_TEMPLATES,
} from './schemas/sequenceSchema';

export type {
  Event,
  EventType,
  EventCategory,
  EventHandler,
  EventBus,
  CRMEventType,
  CommunicationEventType,
  AIEventType,
  AutomationEventType,
  LeadCreatedPayload,
  LeadStatusChangedPayload,
  LeadScoreUpdatedPayload,
  AILeadScoredPayload,
} from './schemas/eventSchema';
export { createEvent, getEventCategory } from './schemas/eventSchema';
