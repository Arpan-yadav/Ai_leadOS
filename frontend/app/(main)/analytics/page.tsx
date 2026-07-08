'use client';
import React from 'react';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const weeklyData = [
  { name: 'Mon', leads: 12, deals: 4, revenue: 8000 },
  { name: 'Tue', leads: 19, deals: 7, revenue: 12000 },
  { name: 'Wed', leads: 8, deals: 3, revenue: 5000 },
  { name: 'Thu', leads: 25, deals: 9, revenue: 18000 },
  { name: 'Fri', leads: 32, deals: 14, revenue: 24000 },
  { name: 'Sat', leads: 15, deals: 6, revenue: 9000 },
  { name: 'Sun', leads: 10, deals: 2, revenue: 6000 },
];

const kpis = [
  { label: 'Total Leads', value: '1,284', change: '+18.2%', trend: 'up', icon: Users },
  { label: 'Conversion Rate', value: '24.6%', change: '+2.1%', trend: 'up', icon: Target },
  { label: 'Revenue Generated', value: '$82,000', change: '+31.4%', trend: 'up', icon: TrendingUp },
  { label: 'Avg. Deal Value', value: '$5,857', change: '-3.2%', trend: 'down', icon: BarChart3 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Analytics</h1>
          <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">Real-time performance metrics and revenue intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {['7D', '30D', '90D', '1Y'].map(p => (
            <button key={p} className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${p === '7D' ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' : 'text-[#b9cacb] hover:text-white hover:bg-white/5'}`}>{p}</button>
          ))}
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass-card p-4 group hover:border-[#00f0ff]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00f0ff]/5 blur-2xl -translate-y-8 translate-x-8" />
            <div className="flex items-start justify-between mb-3">
              <p className="text-[9px] font-black text-[#b9cacb] uppercase tracking-[0.2em]">{k.label}</p>
              <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded ${k.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                {k.trend === 'up' ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                {k.change}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tighter">{k.value}</h3>
              <k.icon size={18} className="text-[#00f0ff]/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Lead Acquisition</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="leads" stroke="#00f0ff" strokeWidth={2} fill="url(#gLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Revenue by Day</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(189,0,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="url(#gRevenue)" radius={[6,6,0,0]}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bd00ff" />
                      <stop offset="100%" stopColor="#00f0ff" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
