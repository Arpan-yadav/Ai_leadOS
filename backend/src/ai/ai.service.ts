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
}

export interface LeadScoreInput {
}

export interface CompanyAnalysisResult {
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
}


@Injectable()
export class AiService {
}