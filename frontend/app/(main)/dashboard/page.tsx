/**
 * @file app/(main)/dashboard/page.tsx
 * @description Dashboard Home Page — Pixel-perfect match to prototype
 * Sprint 2 — Full Stack Implementation
 */
'use client'

import { TrendingUp, Users, Target, BarChart3, ArrowUpRight, ArrowDownRight, Bot, Clock } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false, retries = 3) => {
    if (!silent && !data) setLoading(true);
    setIsSyncing(true);
    let shouldRetry = false;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (retries > 0) {
        shouldRetry = true;
      }
    } catch (e) {
      console.error(e);
      if (retries > 0) {
        shouldRetry = true;
      }
    } 

    if (shouldRetry) {
      setTimeout(() => fetchDashboardData(silent, retries - 1), 1500);
    } else {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const stats = [
    { label: 'Total Revenue', value: data ? `$${data.pipelineValue.toLocaleString()}` : '$0', change: data?.pipelineChange || '+0%', trend: (data?.pipelineChange || '').startsWith('-') ? 'down' : 'up', icon: TrendingUp, color: 'text-emerald-400 light:text-emerald-600', bg: 'bg-emerald-500/10 light:bg-emerald-50' },
    { label: 'Active Leads', value: data ? data.totalLeads.toString() : '0', change: data?.leadsChange || '+0%', trend: (data?.leadsChange || '').startsWith('-') ? 'down' : 'up', icon: Users, color: 'text-[#00f0ff] light:text-blue-600', bg: 'bg-[#00f0ff]/10 light:bg-blue-50' },
    { label: 'Conversion Rate', value: data ? `${data.conversionRate}%` : '0%', change: data?.conversionChange || '+0%', trend: (data?.conversionChange || '').startsWith('-') ? 'down' : 'up', icon: Target, color: 'text-[#bd00ff] light:text-brand-600', bg: 'bg-[#bd00ff]/10 light:bg-brand-50' },
    { label: 'Total Deals', value: data ? data.totalDeals.toString() : '0', change: data?.dealsChange || '+0%', trend: (data?.dealsChange || '').startsWith('-') ? 'down' : 'up', icon: BarChart3, color: 'text-[#ff007a] light:text-violet-600', bg: 'bg-[#ff007a]/10 light:bg-violet-50' },
  ];

  const chartData = data?.chartData || [];
  const sourceData = data?.sourceData || [];
  const recentLeads = data?.recentLeads || [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-white light:text-slate-800 uppercase tracking-widest">Global Intelligence</h1>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.2em] transition-all duration-300 ${
            isSyncing 
              ? 'bg-[#bd00ff]/20 text-[#bd00ff] animate-pulse shadow-[0_0_10px_rgba(189,0,255,0.3)]' 
              : 'bg-[#00f0ff]/10 light:bg-indigo-100 text-[#00f0ff] light:text-indigo-700'
          }`}>
            {isSyncing ? 'Syncing...' : 'Live'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { toast.success('Syncing with database...'); fetchDashboardData(); }} className="btn-secondary h-8 flex items-center gap-2">
            <Clock size={12} className={isSyncing ? "animate-spin text-[#00f0ff]" : ""} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{isSyncing ? 'Syncing...' : 'Real-time'}</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 group hover:border-[#00f0ff]/50 light:hover:border-brand-300 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00f0ff]/5 light:bg-brand-500/5 blur-2xl -translate-y-12 translate-x-12" />
            <div className="flex items-start justify-between">
              <p className="text-[9px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter ${stat.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10 light:text-emerald-700 light:bg-emerald-100' : 'text-rose-400 bg-rose-500/10 light:text-rose-700 light:bg-rose-100'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-white light:text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
              <div className={`text-xs ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white light:text-slate-800">Intelligence Performance</h3>
            <div className="flex items-center gap-4">
              {['Revenue', 'Leads'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${t === 'Revenue' ? 'bg-[#00f0ff] light:bg-indigo-600' : 'bg-[#27272A] light:bg-slate-300'}`} />
                  <span className="text-[10px] font-black uppercase text-[#b9cacb] light:text-slate-400 tracking-widest">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb', fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#16161D', boxShadow: '0 10px 15px -3px rgba(0,240,255,0.1)', padding: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Origin Map */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white light:text-slate-800 mb-8">Lead Origin Map</h3>
          <div className="flex-1 space-y-6">
            {sourceData.map((source: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#b9cacb] light:text-slate-600">{source.name}</span>
                  <span className="text-white light:text-slate-900">{source.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#111114] light:bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]"
                    style={{ width: `${source.value}%`, backgroundColor: source.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 light:border-slate-50 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#16161D] light:border-white bg-[#111114] light:bg-slate-100 flex items-center justify-center overflow-hidden text-[8px] font-bold text-[#00f0ff] light:text-indigo-600 shadow-[0_0_5px_rgba(0,240,255,0.2)] light:shadow-none">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-[#b9cacb] light:text-slate-400 italic">{data?.leadsCapturedToday || 0} newly captured today</p>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
        {/* Intelligence Log */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white light:text-slate-800">Intelligence Log</h3>
            <button onClick={() => router.push('/communications')} className="text-[10px] font-black uppercase tracking-widest text-[#00f0ff] light:text-brand-600 hover:text-[#bd00ff] light:hover:text-brand-700">View Feed</button>
          </div>
          <div className="space-y-6">
            {recentLeads.map((lead: any, i: number) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#111114] light:bg-slate-50 border border-[#27272A] light:border-slate-100 shrink-0 group-hover:border-[#00f0ff] light:group-hover:border-brand-200 transition-colors text-[10px] font-bold text-[#00f0ff] light:text-indigo-600 shadow-[0_0_10px_rgba(0,0,0,0.2)] light:shadow-none overflow-hidden">
                  {lead.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white light:text-slate-900 leading-tight">
                    {lead.name} <span className="font-medium text-[#b9cacb] light:text-slate-400">from</span> {lead.company}
                  </p>
                  <p className="text-[10px] text-[#bd00ff] light:text-brand-600 font-bold uppercase tracking-widest mt-1">Source: {lead.source}</p>
                </div>
                <div className="text-[9px] font-black text-[#b9cacb] light:text-slate-300 uppercase tracking-widest pt-1">{lead.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Strategic Recommendations */}
        <div className="glass-card p-6 border-[#00f0ff]/20 light:border-indigo-100 bg-[#00f0ff]/5 light:bg-indigo-50/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#00f0ff] light:text-indigo-600" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white light:text-slate-800">Strategic Recommendations</h3>
            </div>
          </div>
          <div className="space-y-4">
            {(data?.recommendations?.length > 0 ? data.recommendations : [
              { type: 'High Intent Detected', title: 'System Monitoring Active', description: 'Waiting for AI insights to generate on new leads.' },
              { type: 'Strategy Optimized', title: 'Pipeline Healthy', description: 'Engage with AI Automation to drive more deals.' }
            ]).map((rec: any, i: number) => (
              <div key={i} className="p-4 bg-[#111114] light:bg-white border border-[#27272A] light:border-slate-100 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)] light:shadow-sm hover:border-[#00f0ff] light:hover:border-brand-500 transition-all cursor-pointer active:scale-[0.98]">
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${rec.type.includes('High') ? 'text-[#00f0ff] light:text-indigo-500' : 'text-emerald-400 light:text-emerald-500'}`}>{rec.type}</p>
                  {rec.type.includes('High') && <div className="w-2 h-2 rounded-full bg-emerald-400 light:bg-emerald-500 animate-pulse shadow-[0_0_8px_currentColor]" />}
                </div>
                <h4 className="text-xs font-black text-white light:text-slate-800 uppercase leading-snug">{rec.title}</h4>
                <p className="text-[10px] text-[#b9cacb] light:text-slate-500 mt-2 font-medium italic leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/automation')} className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 text-[10px] uppercase tracking-[0.2em] font-black mt-8 flex items-center justify-center gap-2 py-3 shadow-[0_0_15px_rgba(0,240,255,0.3)] light:shadow-xl light:shadow-indigo-600/10">
            <Bot size={14} />
            <span>Engage AI Automation</span>
          </button>
        </div>
      </div>
    </div>
  );
}