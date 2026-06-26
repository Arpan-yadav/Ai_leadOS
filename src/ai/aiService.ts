/**
 * @module aiService
 * @description AI Service Layer for AI LeadOS
 * Sprint 1 — AI Team Deliverable
 * 
 * This module wraps the Google Gemini API and exposes
 * typed, structured methods for all AI-powered features.
 */

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LeadAnalysisResult {
  analysis: string;
  score: number;
  opportunities: string[];
  risks: string[];
  nextAction: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface OutreachSequence {
  subject: string;
  day: number;
  channel: 'email' | 'whatsapp' | 'linkedin';
  message: string;
}

export interface OutreachPlan {
  leadName: string;
  company: string;
  sequences: OutreachSequence[];
  totalDays: number;
}

export interface WorkflowSuggestion {
  title: string;
  trigger: string;
  actions: string[];
  estimatedImpact: string;
}

// ─── AI Service Class ────────────────────────────────────────────────────────

class AIService {
  private client: GoogleGenAI | null = null;
  private model = 'gemini-1.5-flash';

  /**
   * Lazily initialize the Gemini client.
   * Falls back to demo mode if no API key is present.
   */
  private getClient(): GoogleGenAI | null {
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
      || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined)
      || '';

    if (!apiKey) return null;
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Utility: call Gemini and parse JSON response safely.
   */
  private async generateJSON<T>(prompt: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const result: GenerateContentResponse = await client.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const raw = result.text || '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.error('[AIService] generateJSON error:', err);
      return null;
    }
  }

  // ─── Lead Analyzer ──────────────────────────────────────────────────────

  /**
   * Analyze a company/lead based on their website URL.
   * Used by: AIIntelligence page, LeadAIPulse component
   */
  async analyzeCompany(url: string): Promise<LeadAnalysisResult> {
    const prompt = `
You are an expert B2B sales intelligence analyst.
Analyze the company at website: ${url}

Return a JSON object with exactly these fields:
{
  "analysis": "2-sentence executive summary of the company",
  "score": <number 0-100 sales fitness score>,
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "nextAction": "single most important next sales action to take",
  "sentiment": "positive" | "neutral" | "negative"
}

Only return valid JSON, no markdown, no extra text.`;

    const result = await this.generateJSON<LeadAnalysisResult>(prompt);
    if (result) return result;

    // Demo fallback
    return {
      analysis: `[Demo] ${url} is a growing SaaS company with strong market positioning. Analysis requires a Gemini API key for live intelligence.`,
      score: 78,
      opportunities: [
        'AI-powered workflow automation integration',
        'Enterprise tier upsell potential',
        'Multi-channel communication suite adoption',
      ],
      risks: [
        'Competitive pressure from established platforms',
        'Budget approval cycles may delay decision',
        'Technical integration complexity',
      ],
      nextAction: 'Schedule a 15-minute discovery call to qualify budget and timeline',
      sentiment: 'positive',
    };
  }

  // ─── Outreach Sequence Generator ────────────────────────────────────────

  /**
   * Generate a personalized multi-channel outreach sequence for a lead.
   * Used by: AutomationBuilder, LeadList page
   */
  async generateOutreachSequence(
    leadName: string,
    company: string,
    context: string,
  ): Promise<OutreachPlan> {
    const prompt = `
You are a senior B2B sales strategist.
Create a 7-day multi-channel outreach sequence for lead:
- Name: ${leadName}
- Company: ${company}
- Context: ${context}

Return a JSON object:
{
  "leadName": "${leadName}",
  "company": "${company}",
  "totalDays": 7,
  "sequences": [
    {
      "day": 1,
      "channel": "email",
      "subject": "email subject line",
      "message": "personalized message body (2-3 sentences)"
    }
  ]
}

Include 5 touchpoints: Day 1 (email), Day 2 (linkedin), Day 3 (email), Day 5 (whatsapp), Day 7 (email).
Only return valid JSON.`;

    const result = await this.generateJSON<OutreachPlan>(prompt);
    if (result) return result;

    // Demo fallback
    return {
      leadName,
      company,
      totalDays: 7,
      sequences: [
        { day: 1, channel: 'email', subject: `Quick question for ${company}`, message: `Hi ${leadName}, I noticed your recent work at ${company} and wanted to reach out about how we help similar companies scale their operations.` },
        { day: 2, channel: 'linkedin', subject: 'LinkedIn Connection', message: `${leadName}, connecting here to follow up on my email. Looking forward to learning more about your goals at ${company}.` },
        { day: 3, channel: 'email', subject: `Case study relevant to ${company}`, message: `I wanted to share a quick case study on how a company similar to ${company} increased their pipeline by 40%.` },
        { day: 5, channel: 'whatsapp', subject: 'WhatsApp Follow-up', message: `Hi ${leadName}! Just wanted to check if you had a chance to look at my previous messages. Happy to jump on a quick call!` },
        { day: 7, channel: 'email', subject: `Last attempt — ${company} partnership`, message: `${leadName}, this is my final note. If now isn't the right time, no worries. Feel free to reach back when the timing works!` },
      ],
    };
  }

  // ─── Workflow Suggestion Engine ──────────────────────────────────────────

  /**
   * Suggest automation workflows based on CRM context.
   * Used by: AutomationBuilder page
   */
  async suggestWorkflows(context: string): Promise<WorkflowSuggestion[]> {
    const prompt = `
You are an automation architect for a B2B SaaS CRM.
Context: ${context}

Suggest 3 high-impact automation workflows as a JSON array:
[
  {
    "title": "Workflow name",
    "trigger": "What triggers this workflow",
    "actions": ["action 1", "action 2", "action 3"],
    "estimatedImpact": "Expected business impact in 1 sentence"
  }
]

Only return valid JSON array.`;

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
        estimatedImpact: 'Recover 15-20% of cold leads back into the active pipeline.',
      },
      {
        title: 'Post-Demo Follow-up',
        trigger: 'Meeting status marked as completed',
        actions: ['Send summary email with next steps', 'Create proposal task', 'Schedule follow-up reminder at day 3'],
        estimatedImpact: 'Increase deal progression rate by 35% through timely post-meeting follow-up.',
      },
    ];
  }

  // ─── Lead Scoring ────────────────────────────────────────────────────────

  /**
   * Score a lead based on profile data.
   */
  async scoreLead(leadData: {
    name: string;
    company: string;
    title: string;
    source: string;
    interactions: number;
  }): Promise<{ score: number; reason: string }> {
    const prompt = `
Score this B2B lead from 0-100:
- Name: ${leadData.name}
- Company: ${leadData.company}
- Title: ${leadData.title}
- Source: ${leadData.source}
- Interactions: ${leadData.interactions}

Return JSON: { "score": <number>, "reason": "1-sentence scoring rationale" }
Only valid JSON.`;

    const result = await this.generateJSON<{ score: number; reason: string }>(prompt);
    if (result) return result;

    return {
      score: 70,
      reason: 'Mid-level decision maker at a growth-stage company with moderate engagement signals.',
    };
  }
}

// ─── Singleton Export ────────────────────────────────────────────────────────
export const aiService = new AIService();
export default aiService;
