import { Lead, Deal, Task, Activity, User, AIInsight } from './types';

export const mockUser: User = {
  id: 'u1',
  name: 'Sarah Chen',
  email: 'sarah@aileados.com',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
};

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'James Wilson',
    email: 'james@techcorp.com',
    company: 'TechCorp Solutions',
    title: 'CTO',
    status: 'new',
    score: 85,
    source: 'Meta Leads',
    createdAt: '2026-06-10T10:00:00Z',
    website: 'techcorp.com',
  },
  {
    id: 'l2',
    name: 'Elena Rodriguez',
    email: 'elena@brightmedia.io',
    company: 'BrightMedia',
    title: 'Marketing Director',
    status: 'qualified',
    score: 92,
    source: 'Email',
    createdAt: '2026-06-12T14:30:00Z',
    website: 'brightmedia.io',
  },
  {
    id: 'l3',
    name: 'Michael Chang',
    email: 'm.chang@globus.com',
    company: 'Globus Logistics',
    title: 'Operations Manager',
    status: 'contacted',
    score: 64,
    source: 'WhatsApp',
    createdAt: '2026-06-14T09:15:00Z',
    website: 'globus.com',
  },
  {
    id: 'l4',
    name: 'Sarah Jenkins',
    email: 's.jenkins@innovate.co',
    company: 'Innovate Co',
    title: 'Founder',
    status: 'new',
    score: 78,
    source: 'Cold Outreach',
    createdAt: '2026-06-15T16:45:00Z',
    website: 'innovate.co',
  },
];

export const mockAIInsights: AIInsight[] = [
  {
    leadId: 'l1',
    analysis: 'Strong interest in enterprise-level security features. Recent activity on LinkedIn suggests a push for infrastructure modernization.',
    opportunities: ['Upsell security suite', 'Migration consulting'],
    websiteAudit: 'Modern tech stack, growing team, recently secured Series D funding.',
    sentiment: 'positive',
    qualityScore: 88,
    qualityReason: 'High match with ICP, decision-maker role, active intent signals from Meta Ad engagement.',
    suggestedFollowUp: {
      plan: [
        'Send secure infrastructure whitepaper',
        'Request discovery call specifically about SOC2 compliance',
        'Demonstrate ROI on automated lead scoring'
      ],
      nextAction: 'Send Whitepaper via Email',
      isAutomatedReady: true
    }
  },
  {
    leadId: 'l3',
    analysis: 'Initial inquiry via WhatsApp was brief but urgent regarding logistics optimization.',
    opportunities: ['Real-time tracking upgrade', 'Fleet management'],
    websiteAudit: 'Legacy systems detected, several broken links in customer portal.',
    sentiment: 'neutral',
    qualityScore: 65,
    qualityReason: 'Valid contact, but budget authority is unclear. Source is direct via WhatsApp.',
    suggestedFollowUp: {
      plan: [
        'Confirm budget range via WhatsApp',
        'Share case study of similar logistics transformation',
        'Offer technical audit of current customer portal'
      ],
      nextAction: 'Send Case Study via WhatsApp',
      isAutomatedReady: true
    }
  }
];

export const mockDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Enterprise License - TechCorp',
    amount: 12500,
    stage: 'discovery',
    expectedCloseDate: '2026-07-15T00:00:00Z',
    leadId: 'l1',
    ownerId: 'u1',
    createdAt: '2026-06-11T11:00:00Z',
  },
  {
    id: 'd2',
    title: 'Annual Subscription - BrightMedia',
    amount: 8400,
    stage: 'proposal',
    expectedCloseDate: '2026-07-01T00:00:00Z',
    leadId: 'l2',
    ownerId: 'u1',
    createdAt: '2026-06-13T10:00:00Z',
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Follow up with James Wilson',
    dueDate: '2026-06-20T10:00:00Z',
    priority: 'high',
    status: 'pending',
    assignedTo: 'u1',
    leadId: 'l1',
  },
  {
    id: 't2',
    title: 'Review proposal for BrightMedia',
    dueDate: '2026-06-19T14:00:00Z',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'u1',
    leadId: 'l2',
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'email',
    content: 'Sent introductory email to James.',
    timestamp: '2026-06-11T09:30:00Z',
    userId: 'u1',
    leadId: 'l1',
  },
];
