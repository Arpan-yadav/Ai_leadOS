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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">Global Intelligence</h1>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.2em] animate-pulse">Live Sync</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 group hover:border-brand-300 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl -translate-y-12 translate-x-12" />
            <div className="flex items-start justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`p-1.5 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon size={14} className="text-current" />
              </div>
            </div>
            <p className="font-display text-2xl font-black mt-2 text-slate-900 tracking-tight">{stat.value}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.change.startsWith('+') ? 'text-emerald-700 bg-emerald-100' : 'text-indigo-700 bg-indigo-100'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={10} /> : <TrendingUp size={10} />}
                {stat.change}
              </div>
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
