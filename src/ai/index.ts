/**
 * @module ai/index
 * @description AI Module Public API
 * Sprint 1 — AI Team Deliverable
 * 
 * Single entry point for all AI capabilities.
 * Import from here instead of individual files.
 */

export { aiService, default as AIService } from './aiService';
export type {
  LeadAnalysisResult,
  OutreachSequence,
  OutreachPlan,
  WorkflowSuggestion,
} from './aiService';

export {
  PROMPT_REGISTRY,
  getPrompt,
  listPrompts,
  companyAuditPrompt,
  leadScorerPrompt,
  outreachSequencePrompt,
  workflowSuggesterPrompt,
} from './prompts/leadAnalyzer';
export type { PromptContext, PromptTemplate } from './prompts/leadAnalyzer';
