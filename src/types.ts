/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'executive';
  avatar?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  status: LeadStatus;
  score: number; // 0-100
  source: 'WhatsApp' | 'Email' | 'Meta Leads' | 'LinkedIn' | 'Website' | 'Cold Outreach' | 'Referral';
  lastContacted?: string;
  createdAt: string;
  website?: string;
  linkedin?: string;
}

export type DealStage = 'discovery' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';

export interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: DealStage;
  expectedCloseDate: string;
  leadId: string;
  ownerId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  assignedTo: string;
  leadId?: string;
}

export interface Activity {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'whatsapp' | 'ai_automation';
  content: string;
  timestamp: string;
  userId: string;
  leadId: string;
}

export interface AIInsight {
  leadId: string;
  analysis: string;
  opportunities: string[];
  websiteAudit: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  qualityScore: number;
  qualityReason: string;
  suggestedFollowUp: {
    plan: string[];
    nextAction: string;
    isAutomatedReady: boolean;
  };
}
