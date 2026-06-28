/**
 * @file app/dashboard/page.tsx
 * @description Dashboard Home Page
 * Sprint 1 — Frontend Team Deliverable
 */
'use client'

import { TrendingUp, Users, Target, Zap, ArrowUpRight, Bot, Activity } from 'lucide-react';

const stats = [
  { label: 'Total Leads', value: '248', change: '+12%', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Pipeline Value', value: '$84,200', change: '+8%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Qualified Leads', value: '42', change: '+23%', icon: Target, color: 'text-brand-600 bg-brand-50' },
  { label: 'AI Actions Today', value: '17', change: '+5', icon: Zap, color: 'text-amber-600 bg-amber-50' },
];

const recentActivities = [
  { type: 'ai', content: 'AI scored James Wilson 85/100 — flagged as hot lead', time: '2m ago' },
  { type: 'email', content: 'Outreach sequence started for BrightMedia (Elena Rodriguez)', time: '14m ago' },
  { type: 'deal', content: 'Deal "Enterprise License — TechCorp" moved to Proposal', time: '1h ago' },
  { type: 'lead', content: 'New lead Sarah Jenkins captured from Cold Outreach', time: '2h ago' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <ArrowUpRight size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
              <span className="text-xs text-slate-400">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Panel */}
        <div className="lg:col-span-1 glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-brand-50 rounded-xl">
              <Bot size={18} className="text-brand-600" />
            </div>
            <h2 className="font-bold text-slate-900">AI Insights</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: 'James Wilson', company: 'TechCorp', score: 85 },
              { name: 'Elena Rodriguez', company: 'BrightMedia', score: 92 },
              { name: 'Sarah Jenkins', company: 'Innovate Co', score: 78 },
            ].map((lead) => (
              <div key={lead.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                  {lead.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.company}</p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  lead.score >= 85 ? 'bg-emerald-50 text-emerald-700' :
                  lead.score >= 70 ? 'bg-amber-50 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {lead.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Activity size={18} className="text-slate-600" />
            </div>
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  act.type === 'ai' ? 'bg-brand-500' :
                  act.type === 'email' ? 'bg-emerald-500' :
                  act.type === 'deal' ? 'bg-blue-500' :
                  'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium">{act.content}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
