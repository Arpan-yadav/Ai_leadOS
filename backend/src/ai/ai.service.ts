/**
 * @file ai.service.ts
 * @description NestJS Injectable AI Service — Sprint 2, AI Team
 *
 * Wraps the Google Gemini API as a proper NestJS service.
 * All methods fall back to rich demo data when GEMINI_API_KEY is not set.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

// ─── Response Types ────────────────────────────────────────────────────────────

export interface LeadScoreResult {
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  icpFit: number;
}

export interface LeadScoreInput {
  name: string;
  company: string;
  title?: string;
  source?: string;
  interactions?: number;
}

export interface CompanyAnalysisResult {
  analysis: string;
  score: number;
  opportunities: string[];
  risks: string[];
  nextAction: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface OutreachStep {
  day: number;
  channel: 'email' | 'whatsapp' | 'linkedin';
  subject: string;
  message: string;
}

export interface OutreachPlan {
  leadName: string;
  company: string;
  totalDays: number;
  sequences: OutreachStep[];
}

export interface WorkflowSuggestion {
  title: string;
  trigger: string;
  actions: string[];
  estimatedImpact: string;
}

export interface AnalyticsInsightResult {
  summary: string;
  keyInsights: string[];
  recommendedActions: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model = 'gemini-1.5-flash';
  private client: GoogleGenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** Lazily initialize and return the Gemini client, or null in demo mode. */
  private getClient(): GoogleGenAI | null {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — running in demo mode');
      return null;
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  /** Call Gemini and parse JSON safely. Returns null on any failure. */
  private async generateJSON<T>(prompt: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const result = await client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const raw: string = (result as any).text ?? '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      this.logger.error('generateJSON error:', err);
      return null;
    }
  }

  // ─── Public Methods ────────────────────────────────────────────────────────

  /**
   * Score a lead from 0–100 based on their profile.
   * Called automatically on every POST /leads.
   */
  async scoreLead(input: LeadScoreInput): Promise<LeadScoreResult> {
    const prompt = `
You are a B2B lead qualification expert.
Score this lead and return a structured assessment.

Lead Profile:
- Name: ${input.name}
- Company: ${input.company}
- Title: ${input.title ?? 'Unknown'}
- Source: ${input.source ?? 'Unknown'}
- Interaction Count: ${input.interactions ?? 0}

Return exactly this JSON (no markdown, no extra text):
{
  "score": <integer 0-100>,
  "reason": "<1-sentence explanation of the score>",
  "priority": "<'high' if score>75, 'medium' if 50-75, 'low' if <50>",
  "icpFit": <integer 0-100 representing Ideal Customer Profile fit>
}`.trim();

    const result = await this.generateJSON<LeadScoreResult>(prompt);
    if (result) return result;

    // Demo fallback — deterministic per source for predictable UI
    const sourceScores: Record<string, number> = {
      META_LEADS: 82,
      LINKEDIN: 78,
      WEBSITE: 65,
      EMAIL: 60,
      COLD_OUTREACH: 50,
      WHATSAPP: 55,
      REFERRAL: 88,
    };
    const score = sourceScores[input.source ?? ''] ?? 70;
    return {
      score,
      reason: `[Demo] ${input.title ?? 'Contact'} at ${input.company} via ${input.source ?? 'unknown'} — mid-level qualification.`,
      priority: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
      icpFit: Math.max(score - 10, 40),
    };
  }

  /**
   * Deep company intelligence from a URL.
   * Used by: POST /leads/:id/analyze (Sprint 4)
   */
  async analyzeCompany(url: string): Promise<CompanyAnalysisResult> {
    const prompt = `
You are an expert B2B sales intelligence analyst.
Analyze the company at: ${url}

Return exactly this JSON (no markdown):
{
  "analysis": "<2-sentence executive summary>",
  "score": <integer 0-100 sales fitness score>,
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "nextAction": "<single most impactful next sales action>",
  "sentiment": "<'positive' | 'neutral' | 'negative'>"
}`.trim();

    const result = await this.generateJSON<CompanyAnalysisResult>(prompt);
    if (result) return result;

    return {
      analysis: `[Demo] ${url} is a growth-stage B2B company with strong market signals. Live analysis requires a valid GEMINI_API_KEY.`,
      score: 78,
      opportunities: [
        'AI-powered workflow automation integration',
        'Enterprise tier upsell potential',
        'Multi-channel communication suite adoption',
      ],
      risks: [
        'Competitive pressure from established CRM platforms',
        'Budget approval cycles may delay decision',
        'Technical integration complexity with existing stack',
      ],
      nextAction: 'Schedule a 15-minute discovery call to qualify budget and timeline',
      sentiment: 'positive',
    };
  }

  /**
   * Generate a personalized 7-day multi-channel outreach sequence.
   */
  async generateOutreachSequence(
    leadName: string,
    company: string,
    context?: string,
  ): Promise<OutreachPlan> {
    const prompt = `
You are a senior B2B sales strategist.
Create a 7-day multi-channel outreach sequence.

Lead: ${leadName} at ${company}
Context: ${context ?? 'Standard B2B outreach'}

Return JSON:
{
  "leadName": "${leadName}",
  "company": "${company}",
  "totalDays": 7,
  "sequences": [
    { "day": 1, "channel": "email", "subject": "<subject>", "message": "<2-3 sentence message>" },
    { "day": 2, "channel": "linkedin", "subject": "Connection Request", "message": "<message>" },
    { "day": 3, "channel": "email", "subject": "<subject>", "message": "<message>" },
    { "day": 5, "channel": "whatsapp", "subject": "Quick check-in", "message": "<message>" },
    { "day": 7, "channel": "email", "subject": "<final subject>", "message": "<message>" }
  ]
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<OutreachPlan>(prompt);
    if (result) return result;

    return {
      leadName,
      company,
      totalDays: 7,
      sequences: [
        { day: 1, channel: 'email', subject: `Quick question for ${company}`, message: `Hi ${leadName}, I noticed your work at ${company} and wanted to explore how we help similar teams scale with AI-powered workflows.` },
        { day: 2, channel: 'linkedin', subject: 'LinkedIn Connection', message: `${leadName}, connecting here to follow up. Looking forward to learning about your growth goals at ${company}.` },
        { day: 3, channel: 'email', subject: `Case study relevant to ${company}`, message: `Sharing a case study on how a company similar to ${company} increased their qualified pipeline by 40% with AI lead scoring.` },
        { day: 5, channel: 'whatsapp', subject: 'Quick check-in', message: `Hi ${leadName}! Just checking if you had a chance to review my messages. Happy to jump on a quick call!` },
        { day: 7, channel: 'email', subject: `Last note — ${company} partnership`, message: `${leadName}, this is my final note for now. Feel free to reach back whenever the timing works!` },
      ],
    };
  }

  /**
   * Suggest automation workflows based on CRM context.
   */
  async suggestWorkflows(context?: string): Promise<WorkflowSuggestion[]> {
    const prompt = `
You are an automation architect for a B2B SaaS CRM.
Context: ${context ?? 'Standard B2B sales team with active lead pipeline'}

Suggest 3 high-impact automation workflows as a JSON array:
[
  {
    "title": "<workflow name>",
    "trigger": "<what triggers this workflow>",
    "actions": ["<action 1>", "<action 2>", "<action 3>"],
    "estimatedImpact": "<expected business impact>"
  }
]

Only return valid JSON array.`.trim();

    const result = await this.generateJSON<WorkflowSuggestion[]>(prompt);
    if (result) return result;

    return [
      {
        title: 'Hot Lead Instant Alert',
        trigger: 'Lead score exceeds 80',
        actions: ['Send Slack alert to sales team', 'Create high-priority task', 'Schedule discovery call email'],
        estimatedImpact: 'Reduce lead response time from hours to minutes, improving conversion by ~25%.',
      },
      {
        title: 'Re-engagement Drip',
        trigger: 'No lead activity for 14 days',
        actions: ['Send personalized WhatsApp check-in', 'Update CRM status to re-nurture', 'Queue email sequence'],
        estimatedImpact: 'Recover 15–20% of cold leads back into active pipeline.',
      },
      {
        title: 'Post-Demo Follow-up',
        trigger: 'Meeting status marked as completed',
        actions: ['Send summary email with next steps', 'Create proposal task', 'Schedule follow-up reminder at day 3'],
        estimatedImpact: 'Increase deal progression rate by 35% through timely post-meeting follow-up.',
      },
    ];
  }

  /**
   * Suggest tasks based on generic B2B pipeline activities.
   */
  async suggestTasks(): Promise<{ title: string; priority: 'low' | 'medium' | 'high' }[]> {
    return [
      { title: 'Follow up with stale leads in Proposal stage', priority: 'high' },
      { title: 'Prepare Q3 performance review for key accounts', priority: 'medium' },
      { title: 'Review unassigned incoming web leads', priority: 'low' },
    ];
  }

  /**
   * Generate a personalized email draft for a lead.
   */
  async generateEmailDraft(leadName: string, company: string, title?: string, instructions?: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return `Subject: Quick question for ${leadName} at ${company}\n\nHi ${leadName},\n\nI hope this message finds you well. I was reviewing your profile as ${title ?? 'a leader'} at ${company} and wanted to reach out. I would love to share how our platform can help you automate your workflows.\n\nBest regards,\nSales Team`;
    }

    try {
      const prompt = `
You are an expert sales representative.
Write a personalized outreach email to a lead.

Lead Details:
- Name: ${leadName}
- Company: ${company}
- Title: ${title ?? 'Unknown'}
- Extra instructions/context: ${instructions ?? 'Introduce our AI LeadOS platform'}

Return only the email subject line and body. No other conversational text or markdown blocks.`.trim();

      const result = await client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return (result as any).text ?? '';
    } catch (err) {
      this.logger.error('generateEmailDraft error:', err);
      return 'Failed to generate email draft.';
    }
  }

  /**
   * Generate highly personalized outreach message using Gemini
   */
  async generatePersonalizedMessage(leadName: string, company: string, context?: string): Promise<{ message: string }> {
    const prompt = `
You are a top-tier B2B sales copywriter.
Write a personalized opening email or message.

Lead: ${leadName} at ${company}
Context: ${context ?? 'Standard B2B intro'}

Return JSON:
{
  "message": "<the generated message>"
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<{ message: string }>(prompt);
    if (result) return result;

    return {
      message: `Hi ${leadName},\n\nI was researching ${company} and noticed some impressive growth. I thought it would be a great time to connect and explore how our platform could help your team scale even faster.\n\nWould you be open to a brief chat next week?`
    };
  }

  /**
   * Suggest optimal send time based on lead details
   */
  async suggestOptimalSendTime(leadName: string, company: string): Promise<{ suggestedTime: string, reason: string }> {
    const prompt = `
You are a B2B sales optimization engine.
Suggest the best time and day to send a cold outreach message to:
Lead: ${leadName}
Company: ${company}

Return JSON:
{
  "suggestedTime": "<e.g., Tuesday at 10:00 AM local time>",
  "reason": "<short explanation why>"
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<{ suggestedTime: string, reason: string }>(prompt);
    if (result) return result;

    return {
      suggestedTime: "Tuesday at 10:00 AM",
      reason: "Mid-morning on Tuesday typically sees the highest open rates for B2B executives before their afternoon meetings."
    };
  }

  /**
   * Generate an autonomous reply as a sales executive based on recent conversation history.
   */
  async generateAutonomousReply(leadName: string, company: string, messageHistory: string[]): Promise<{ reply: string }> {
    const prompt = `
You are a highly skilled, polite, and persuasive B2B sales executive working for a CRM software company.
A lead has just replied to your message. You need to read the recent conversation history and generate an appropriate, concise, and human-sounding response.

Lead: ${leadName}
Company: ${company}

Recent Conversation History (from oldest to newest):
${messageHistory.map((msg, i) => `[${i + 1}] ${msg}`).join('\n')}

Generate the next logical response. Keep it under 3 sentences. Be helpful and try to move them towards a demo or call if they show intent.

Return JSON:
{
  "reply": "<the generated message>"
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<{ reply: string }>(prompt);
    if (result) return result;

    return {
      reply: `Thanks for the response, ${leadName}. I completely understand. Would it make sense to schedule a quick 5-minute call to discuss how we can help ${company}?`
    };
  }

  /**
   * Generates a data science level analysis of dashboard metrics.
   */
  async generateAnalyticsInsight(metricsData: any): Promise<AnalyticsInsightResult> {
    const prompt = `
You are an expert Data Scientist analyzing the sales pipeline and team performance metrics.
Review the following metrics and provide a comprehensive analysis of trends, anomalies, and actionable recommendations.

Metrics:
${JSON.stringify(metricsData, null, 2)}

Return JSON:
{
  "summary": "<A 2-3 sentence executive summary of the overall performance>",
  "keyInsights": [
    "<insight 1>",
    "<insight 2>"
  ],
  "recommendedActions": [
    "<action 1>",
    "<action 2>"
  ]
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<AnalyticsInsightResult>(prompt);
    if (result) return result;

    return {
      summary: "Performance has remained steady over the selected period. Strong conversion rates from Discovery to Proposal stages suggest effective initial qualification.",
      keyInsights: [
        "Inbound leads continue to be the primary driver of high-value deals.",
        "A noticeable bottleneck occurs at the Negotiation stage, increasing the average sales cycle length."
      ],
      recommendedActions: [
        "Implement a targeted retargeting campaign for stalled deals in the Negotiation stage.",
        "Increase automated email touchpoints for lower-tier outbound leads to improve early engagement."
      ]
    };
  }
}
