/**
 * @module prompts/leadAnalyzer
 * @description Lead Analyzer Prompt Library
 * Sprint 1 — AI Team Deliverable
 * 
 * Centralized prompt templates for all lead analysis AI flows.
 * This is the single source of truth for all AI prompts in the system.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PromptContext {
  leadName?: string;
  company?: string;
  url?: string;
  title?: string;
  source?: string;
  score?: number;
  interactions?: number;
  customContext?: string;
}

export interface PromptTemplate {
  name: string;
  description: string;
  version: string;
  model: string;
  build: (ctx: PromptContext) => string;
  outputSchema: string;
}

// ─── Prompt Registry ──────────────────────────────────────────────────────────

/**
 * PROMPT: Company Intelligence Audit
 * Analyzes a company website to generate sales intelligence.
 */
export const companyAuditPrompt: PromptTemplate = {
  name: 'company_audit',
  description: 'Analyzes a company website URL and returns structured sales intelligence.',
  version: '1.0.0',
  model: 'gemini-1.5-flash',
  outputSchema: `{
    "analysis": "string",
    "score": "number (0-100)",
    "opportunities": "string[]",
    "risks": "string[]",
    "nextAction": "string",
    "sentiment": "'positive' | 'neutral' | 'negative'"
  }`,
  build: (ctx: PromptContext) => `
You are an expert B2B sales intelligence analyst.
Analyze the company at website: ${ctx.url}

Your task is to generate deep sales intelligence that helps a B2B sales team qualify and prioritize this company.

Return a JSON object with exactly these fields:
{
  "analysis": "<2-sentence executive summary describing what the company does and their market position>",
  "score": <integer 0-100 representing their sales fitness and likelihood to convert>,
  "opportunities": [
    "<specific B2B sales or upsell opportunity #1>",
    "<specific B2B sales or upsell opportunity #2>",
    "<specific B2B sales or upsell opportunity #3>"
  ],
  "risks": [
    "<specific business or operational risk that could block a deal #1>",
    "<specific risk #2>",
    "<specific risk #3>"
  ],
  "nextAction": "<single most impactful next sales action>",
  "sentiment": "<'positive', 'neutral', or 'negative' based on growth trajectory>"
}

Scoring rubric:
- 80-100: Strong ICP match, clear budget signals, decision maker accessible
- 60-79: Moderate fit, some qualification needed
- 40-59: Weak fit or unclear intent
- 0-39: Poor match or declining company

Only return valid JSON, no markdown, no extra text.`.trim(),
};

/**
 * PROMPT: Lead Intent Scorer
 * Scores an individual lead based on profile and behavioral data.
 */
export const leadScorerPrompt: PromptTemplate = {
  name: 'lead_scorer',
  description: 'Scores a lead from 0-100 based on their profile attributes.',
  version: '1.0.0',
  model: 'gemini-1.5-flash',
  outputSchema: `{
    "score": "number (0-100)",
    "reason": "string",
    "priority": "'high' | 'medium' | 'low'",
    "icpFit": "number (0-100)"
  }`,
  build: (ctx: PromptContext) => `
You are a B2B lead qualification expert.
Score this lead and return a structured qualification assessment.

Lead Profile:
- Name: ${ctx.leadName || 'Unknown'}
- Company: ${ctx.company || 'Unknown'}
- Title: ${ctx.title || 'Unknown'}
- Source: ${ctx.source || 'Unknown'}
- Interaction Count: ${ctx.interactions || 0}

Return JSON:
{
  "score": <integer 0-100>,
  "reason": "<1-sentence explanation of the score>",
  "priority": "<'high' if score>75, 'medium' if 50-75, 'low' if <50>",
  "icpFit": <integer 0-100 representing Ideal Customer Profile fit>
}

Only return valid JSON.`.trim(),
};

/**
 * PROMPT: Outreach Sequence Generator
 * Generates a personalized multi-channel outreach sequence.
 */
export const outreachSequencePrompt: PromptTemplate = {
  name: 'outreach_sequence',
  description: 'Generates a personalized 7-day multi-channel outreach sequence.',
  version: '1.0.0',
  model: 'gemini-1.5-flash',
  outputSchema: `{
    "leadName": "string",
    "company": "string",
    "totalDays": "number",
    "sequences": [{
      "day": "number",
      "channel": "'email' | 'whatsapp' | 'linkedin'",
      "subject": "string",
      "message": "string"
    }]
  }`,
  build: (ctx: PromptContext) => `
You are a senior B2B sales strategist specializing in personalized outreach.
Create a 7-day multi-channel outreach sequence.

Lead Context:
- Name: ${ctx.leadName}
- Company: ${ctx.company}
- Additional Context: ${ctx.customContext || 'No additional context'}

Requirements:
- 5 touchpoints total across the 7 days
- Mix of email, whatsapp, and linkedin channels
- Each message should be personalized, concise (2-3 sentences), and value-driven
- Progressively adjust tone from professional → casual → final attempt

Return JSON:
{
  "leadName": "${ctx.leadName}",
  "company": "${ctx.company}",
  "totalDays": 7,
  "sequences": [
    { "day": 1, "channel": "email", "subject": "<subject>", "message": "<message>" },
    { "day": 2, "channel": "linkedin", "subject": "Connection Request", "message": "<message>" },
    { "day": 3, "channel": "email", "subject": "<subject>", "message": "<message>" },
    { "day": 5, "channel": "whatsapp", "subject": "Quick check-in", "message": "<message>" },
    { "day": 7, "channel": "email", "subject": "<final subject>", "message": "<message>" }
  ]
}

Only return valid JSON.`.trim(),
};

/**
 * PROMPT: Automation Workflow Suggester
 * Suggests high-impact automation workflows based on CRM context.
 */
export const workflowSuggesterPrompt: PromptTemplate = {
  name: 'workflow_suggester',
  description: 'Suggests automation workflows based on CRM usage patterns.',
  version: '1.0.0',
  model: 'gemini-1.5-flash',
  outputSchema: `[{
    "title": "string",
    "trigger": "string",
    "actions": "string[]",
    "estimatedImpact": "string"
  }]`,
  build: (ctx: PromptContext) => `
You are an automation architect for a B2B SaaS CRM platform.
Context about the current CRM state: ${ctx.customContext || 'Standard B2B sales team with active lead pipeline'}

Suggest 3 high-impact automation workflows that would save time and improve conversion rates.

Return a JSON array:
[
  {
    "title": "<short workflow name>",
    "trigger": "<what event triggers this workflow>",
    "actions": [
      "<action 1>",
      "<action 2>",
      "<action 3>"
    ],
    "estimatedImpact": "<expected business impact in 1 sentence>"
  }
]

Only return valid JSON array.`.trim(),
};

// ─── Prompt Registry Map ──────────────────────────────────────────────────────

export const PROMPT_REGISTRY: Record<string, PromptTemplate> = {
  company_audit: companyAuditPrompt,
  lead_scorer: leadScorerPrompt,
  outreach_sequence: outreachSequencePrompt,
  workflow_suggester: workflowSuggesterPrompt,
};

/**
 * Get a prompt template by name.
 */
export function getPrompt(name: string): PromptTemplate | undefined {
  return PROMPT_REGISTRY[name];
}

/**
 * List all available prompts.
 */
export function listPrompts(): PromptTemplate[] {
  return Object.values(PROMPT_REGISTRY);
}
