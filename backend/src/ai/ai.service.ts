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
import { PrismaService } from '../prisma/prisma.service';

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
  private readonly model = 'gemini-flash-latest';
  private client: GoogleGenAI | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /** 
   * Returns a Gemini client for the given user.
   * Priority: user's DB key → system .env key → null (demo mode).
   */
  private async getClientForUser(userId?: string): Promise<GoogleGenAI | null> {
    // 1. Try user-specific key from DB
    if (userId) {
      try {
        const settings = await this.prisma.tenantSettings.findUnique({ where: { tenantId: userId } });
        if (settings?.geminiApiKey) {
          return new GoogleGenAI({ apiKey: settings.geminiApiKey });
        }
      } catch {
        // If DB lookup fails, fall through to system key
      }
    }
    // 2. Fall back to system .env key
    return this.getClient();
  }

  /** Lazily initialize and return the system Gemini client, or null in demo mode. */
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
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.message?.includes('quota') || err?.status === 429) {
        this.logger.warn(`AI Rate limit hit (429). Using fallback JSON data.`);
      } else {
        this.logger.error('generateJSON error:', err?.message || err);
      }
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
   * Auto-Pilot: Analyze a lead and generate a custom 14-day sequence.
   */
  async generateDynamicStrategy(
    leadName: string,
    company: string,
    title: string | undefined,
    score: number
  ): Promise<OutreachPlan & { masterWorkflow: string }> {
    const prompt = `
You are an elite B2B sales automation agent.
Your goal is to evaluate this specific lead and construct the absolute best highly-personalized 14-day outreach sequence.
You must also categorize this lead into ONE of these 5 Master Workflows:
1. "High Intent" (Score > 80)
2. "Warm Nurture" (Score 50-80)
3. "Cold Re-engagement" (Score < 50)
4. "Partner Setup" (If they seem like a partner/referral)
5. "VIP Enterprise Flow" (If they are C-Level at a large enterprise)

Lead Profile:
- Name: ${leadName}
- Company: ${company}
- Title: ${title ?? 'Unknown'}
- Lead Score: ${score}/100

Return EXACTLY this JSON structure:
{
  "leadName": "${leadName}",
  "company": "${company}",
  "masterWorkflow": "<exact name from the 5 options above>",
  "totalDays": 14,
  "sequences": [
    { "day": 1, "channel": "email", "subject": "<subject>", "message": "<hyper-personalized email>" },
    { "day": 3, "channel": "linkedin", "subject": "Connection Request", "message": "<message>" }
  ]
}

Only return the raw valid JSON. Do not include markdown formatting.`.trim();

    const result = await this.generateJSON<OutreachPlan & { masterWorkflow: string }>(prompt);
    if (result) return result;

    // Fallback if API key is missing
    let workflow = "Warm Nurture";
    if (score > 80) workflow = "High Intent";
    else if (score < 50) workflow = "Cold Re-engagement";
    if (title && title.toLowerCase().includes('ceo')) workflow = "VIP Enterprise Flow";

    return {
      leadName,
      company,
      masterWorkflow: workflow,
      totalDays: 14,
      sequences: [
        { day: 1, channel: 'email', subject: `Strategic initiatives at ${company}`, message: `Hi ${leadName}, noticed your role as ${title ?? 'a leader'} at ${company} and wanted to see if you're exploring AI automation.` },
        { day: 2, channel: 'linkedin', subject: 'LinkedIn Connection', message: `Connecting to follow your work at ${company}, ${leadName}.` },
        { day: 4, channel: 'email', subject: `Re: Strategic initiatives at ${company}`, message: `Just bubbling this up, ${leadName}. We've helped companies similar to ${company} save 20 hours/week.` },
        { day: 7, channel: 'whatsapp', subject: 'Quick follow up', message: `Hi ${leadName}, leaving a quick note here. Let me know if you prefer email.` },
        { day: 10, channel: 'email', subject: `Relevant case study`, message: `Thought this case study on automation would be relevant for your team at ${company}.` },
        { day: 14, channel: 'email', subject: `Closing the loop`, message: `I'll stop reaching out for now, ${leadName}. Keep up the great work at ${company}!` },
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
  async suggestTasks(contextData?: any): Promise<{ title: string; priority: 'low' | 'medium' | 'high' }[]> {
    const client = this.getClient();
    
    // Deterministic fallback algorithm if no Gemini API key or request fails
    const fallbackLogic = () => {
      const suggestions: { title: string; priority: 'low' | 'medium' | 'high' }[] = [];
      if (contextData?.activeDeals) {
        contextData.activeDeals.forEach((deal: any) => {
          if (deal.stage === 'NEGOTIATION') {
            suggestions.push({ title: `Follow up on $${deal.amount.toLocaleString()} deal with ${deal.lead?.company || deal.lead?.name}`, priority: 'high' });
          } else if (deal.stage === 'PROPOSAL') {
            suggestions.push({ title: `Check if ${deal.lead?.company || deal.lead?.name} reviewed the proposal`, priority: 'medium' });
          }
        });
      }
      if (contextData?.newLeads) {
        contextData.newLeads.forEach((lead: any) => {
          suggestions.push({ title: `Initial outreach to new lead: ${lead.name} from ${lead.company}`, priority: 'medium' });
        });
      }
      if (suggestions.length === 0) {
        suggestions.push({ title: 'Review unassigned incoming web leads', priority: 'low' });
      }
      return suggestions.slice(0, 3);
    };

    if (!client) {
      return fallbackLogic();
    }

    try {
      const prompt = `
You are an expert sales manager AI. Your job is to analyze the following CRM database extract and suggest 3 highly actionable, specific tasks for a sales representative.
Prioritize deals in Negotiation or Proposal, and new untouched leads.

Database Context:
${JSON.stringify(contextData, null, 2)}

Respond ONLY with a valid JSON array of objects. Each object must have exactly two fields:
1. "title": A short, actionable task description (e.g. "Follow up with TechCorp on $50k proposal").
2. "priority": Exactly one of "high", "medium", or "low".

Do not include markdown blocks or any other text. Return pure JSON.
`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawText: string = (response as any).text ?? '';
      const text = rawText.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed.slice(0, 5); // Return up to 5 tasks
      }
      return fallbackLogic();
    } catch (err) {
      this.logger.error(`AI Task Suggestion failed: ${(err as Error).message}`);
      return fallbackLogic();
    }
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
    } catch (err: any) {
      if (err?.message?.includes('429') || err?.message?.includes('quota') || err?.status === 429) {
        this.logger.warn(`AI Rate limit hit (429). Using fallback template for ${leadName}.`);
        return `Subject: Following up regarding ${company}\n\nHi ${leadName},\n\nI wanted to reach out regarding your current processes at ${company}. Let's chat soon.\n\nBest,\nSales Team`;
      }
      this.logger.error('generateEmailDraft error:', err?.message || err);
      return `Subject: Following up regarding ${company}\n\nHi ${leadName},\n\nI wanted to reach out regarding your current processes at ${company}. Let's chat soon.\n\nBest,\nSales Team`;
    }
  }

  /**
   * Generate highly personalized outreach message using Gemini
   */
  async generatePersonalizedMessage(leadName: string, company: string, context?: string): Promise<{ message: string }> {
    const prompt = `
You are an elite B2B Sales Development Representative (SDR) known for writing hyper-personalized, high-converting outreach messages.
Your task is to write a highly unique and personalized opening message for a prospect.

Lead: ${leadName}
Company: ${company}
Context/Channel: ${context ?? 'Standard B2B intro'}

Instructions:
1. Simulate deep research on "${company}". Identify their likely industry, typical business model, and common pain points for a company of their profile.
2. Weave this "research" seamlessly into the opening line to prove you understand their specific business context. Do NOT use generic phrases like "I noticed your impressive growth".
3. Propose a highly specific value hypothesis on how AI automation can solve their exact pain points.
4. Keep the message under 4 sentences. Keep it conversational, not overly formal.

Return exactly this JSON (no markdown):
{
  "message": "<the generated message>"
}`.trim();

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

  // ─── Sprint 7: AI Weekly Performance Summary ──────────────────────────────
  async generateAnalyticsSummary(metrics: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalDeals: number;
    wonDeals: number;
    wonRevenue: number;
    topPerformer: { name: string; score: number; dealsWon: number } | null;
  }) {
    const prompt = `
You are an AI sales analytics assistant. Generate a concise weekly performance report based on these real CRM metrics.

Metrics:
- Total Leads: ${metrics.totalLeads}
- Converted Leads: ${metrics.convertedLeads} (${metrics.conversionRate}% conversion rate)
- Total Deals: ${metrics.totalDeals}
- Won Deals: ${metrics.wonDeals}
- Revenue Won: $${metrics.wonRevenue.toLocaleString()}
- Top Performer: ${metrics.topPerformer ? `${metrics.topPerformer.name} (${metrics.topPerformer.dealsWon} deals won, score: ${metrics.topPerformer.score})` : 'N/A'}

Return a JSON object:
{
  "headline": "<one powerful summary sentence>",
  "summary": "<2-3 sentence narrative of overall performance>",
  "highlights": ["<positive highlight 1>", "<positive highlight 2>", "<positive highlight 3>"],
  "warnings": ["<risk or concern 1>", "<risk or concern 2>"],
  "recommendation": "<single most important action to take this week>"
}

Only return valid JSON.`.trim();

    const result = await this.generateJSON<{
      headline: string;
      summary: string;
      highlights: string[];
      warnings: string[];
      recommendation: string;
    }>(prompt);

    if (result) return result;

    return {
      headline: `${metrics.wonDeals} deals won this period with ${metrics.conversionRate}% conversion rate.`,
      summary: `The team managed ${metrics.totalLeads} leads and closed ${metrics.wonDeals} deals generating $${metrics.wonRevenue.toLocaleString()} in revenue. Conversion rate stands at ${metrics.conversionRate}%.`,
      highlights: [
        `${metrics.convertedLeads} leads successfully converted`,
        `$${metrics.wonRevenue.toLocaleString()} total revenue won`,
        metrics.topPerformer ? `${metrics.topPerformer.name} leads the team with ${metrics.topPerformer.dealsWon} deals` : 'Team performing consistently',
      ],
      warnings: [
        metrics.conversionRate < 20 ? 'Conversion rate below 20% — review qualification criteria' : 'Monitor pipeline velocity closely',
        'Ensure all leads have recent activity logged',
      ],
      recommendation: metrics.conversionRate < 15
        ? 'Focus on lead qualification — too many unqualified leads are diluting conversion rate.'
        : 'Accelerate follow-ups on deals in Negotiation stage to close before end of period.',
    };
  }
}
