/**
 * @module automation/schemas/sequenceSchema
 * @description Sequence Engine Schema Definitions
 * Sprint 1 — Automation Team Deliverable
 * 
 * A Sequence is a time-based, multi-step communication campaign.
 * Unlike workflows (event-driven), sequences run on a fixed schedule
 * tied to a lead's enrollment date.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SequenceStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type StepChannel = 'email' | 'whatsapp' | 'linkedin' | 'sms' | 'task';
export type EnrollmentTrigger = 'manual' | 'lead_created' | 'workflow' | 'tag_added' | 'status_changed';
export type ExitCondition = 'replied' | 'converted' | 'unsubscribed' | 'completed_all_steps' | 'custom';

// ─── Step Definitions ─────────────────────────────────────────────────────────

export interface SequenceStepTemplate {
  /** Template key for AI-generated or pre-written content */
  templateKey?: string;
  /** Raw content if not using a template */
  rawContent?: string;
  /** Subject line (email only) */
  subject?: string;
  /** Whether to use AI to personalize this message */
  aiPersonalized: boolean;
  /** Variables to inject into the template */
  variables?: Record<string, string>;
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  /** Delay from previous step (or enrollment for step 1) in hours */
  delayHours: number;
  channel: StepChannel;
  template: SequenceStepTemplate;
  /** A/B test variant (optional) */
  variant?: 'A' | 'B';
  /** Condition to skip this step */
  skipCondition?: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
}

// ─── Sequence Definition ──────────────────────────────────────────────────────

export interface SequenceEnrollmentSettings {
  trigger: EnrollmentTrigger;
  /** For workflow: the workflow node ID that triggers enrollment */
  workflowNodeId?: string;
  /** For tag_added: the tag name */
  tagName?: string;
  /** For status_changed: the new status */
  targetStatus?: string;
  /** Whether to re-enroll leads who have exited */
  allowReEnrollment: boolean;
  /** Max leads enrolled concurrently */
  maxConcurrentLeads?: number;
}

export interface SequenceExitSettings {
  conditions: ExitCondition[];
  /** For 'custom': the custom condition expression */
  customCondition?: string;
  /** Whether to move lead to next stage on conversion */
  advancePipelineOnConvert: boolean;
}

export interface SequenceMetrics {
  totalEnrolled: number;
  activeEnrollments: number;
  completedEnrollments: number;
  exitedEarly: number;
  conversionRate: number;
  avgOpenRate: number;
  avgReplyRate: number;
}

export interface Sequence {
  id: string;
  name: string;
  description: string;
  status: SequenceStatus;
  steps: SequenceStep[];
  enrollment: SequenceEnrollmentSettings;
  exit: SequenceExitSettings;
  metrics: SequenceMetrics;
  /** Total duration of the sequence in days */
  durationDays: number;
  /** Whether this sequence uses AI for personalization */
  aiEnabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ─── Enrollment Record ────────────────────────────────────────────────────────

export type EnrollmentStatus = 'active' | 'completed' | 'exited' | 'paused' | 'error';

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  leadId: string;
  status: EnrollmentStatus;
  currentStepNumber: number;
  enrolledAt: string;
  nextStepAt?: string;
  exitedAt?: string;
  exitReason?: ExitCondition | string;
  stepHistory: {
    stepId: string;
    stepNumber: number;
    executedAt: string;
    result: 'sent' | 'failed' | 'skipped';
    error?: string;
  }[];
}

// ─── Factory Functions ────────────────────────────────────────────────────────

export function createSequence(
  partial: Partial<Sequence> & { name: string; createdBy: string }
): Sequence {
  const now = new Date().toISOString();
  return {
    id: `seq_${Date.now()}`,
    name: partial.name,
    description: partial.description || '',
    status: 'draft',
    steps: partial.steps || [],
    enrollment: partial.enrollment || {
      trigger: 'manual',
      allowReEnrollment: false,
    },
    exit: partial.exit || {
      conditions: ['replied', 'converted', 'completed_all_steps'],
      advancePipelineOnConvert: true,
    },
    metrics: {
      totalEnrolled: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      exitedEarly: 0,
      conversionRate: 0,
      avgOpenRate: 0,
      avgReplyRate: 0,
    },
    durationDays: partial.durationDays || 7,
    aiEnabled: partial.aiEnabled ?? true,
    tags: partial.tags || [],
    createdAt: now,
    updatedAt: now,
    createdBy: partial.createdBy,
  };
}

export function createSequenceStep(
  stepNumber: number,
  channel: StepChannel,
  delayHours: number,
  template: SequenceStepTemplate
): SequenceStep {
  return {
    id: `step_${Date.now()}_${stepNumber}`,
    stepNumber,
    delayHours,
    channel,
    template,
    metrics: { sent: 0, opened: 0, clicked: 0, replied: 0 },
  };
}

// ─── Sequence Templates ───────────────────────────────────────────────────────

export const SEQUENCE_TEMPLATES: Partial<Sequence>[] = [
  {
    name: '7-Day Cold Outreach',
    description: 'A 5-touchpoint cold outreach sequence across email and WhatsApp.',
    durationDays: 7,
    aiEnabled: true,
    tags: ['cold-outreach', 'ai-personalized'],
  },
  {
    name: 'Post-Demo Nurture',
    description: 'Follow-up sequence triggered after a demo call is completed.',
    durationDays: 14,
    aiEnabled: true,
    tags: ['post-demo', 'nurture'],
  },
  {
    name: 'Welcome Sequence',
    description: 'Introductory sequence for all newly created leads.',
    durationDays: 3,
    aiEnabled: false,
    tags: ['welcome', 'onboarding'],
  },
];
