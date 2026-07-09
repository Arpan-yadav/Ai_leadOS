'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const dataSets: Record<string, {
  weeklyData: any[],
  kpis: any[]
}> = {
  '7D': {
    weeklyData: [
      { name: 'Mon', leads: 12, deals: 4, revenue: 8000 },
      { name: 'Tue', leads: 19, deals: 7, revenue: 12000 },
      { name: 'Wed', leads: 8, deals: 3, revenue: 5000 },
      { name: 'Thu', leads: 25, deals: 9, revenue: 18000 },
      { name: 'Fri', leads: 32, deals: 14, revenue: 24000 },
      { name: 'Sat', leads: 15, deals: 6, revenue: 9000 },
      { name: 'Sun', leads: 10, deals: 2, revenue: 6000 },
    ],
    kpis: [
      { label: 'Total Leads', value: '121', change: '+18.2%', trend: 'up', icon: Users },
      { label: 'Conversion Rate', value: '24.6%', change: '+2.1%', trend: 'up', icon: Target },
      { label: 'Revenue Generated', value: '$82,000', change: '+31.4%', trend: 'up', icon: TrendingUp },
      { label: 'Avg. Deal Value', value: '$5,857', change: '-3.2%', trend: 'down', icon: BarChart3 },
    ]
  },
  '30D': {
    weeklyData: [
      { name: 'W1', leads: 45, deals: 12, revenue: 32000 },
      { name: 'W2', leads: 52, deals: 18, revenue: 45000 },
      { name: 'W3', leads: 38, deals: 10, revenue: 28000 },
      { name: 'W4', leads: 65, deals: 24, revenue: 58000 },
    ],
    kpis: [
      { label: 'Total Leads', value: '542', change: '+5.4%', trend: 'up', icon: Users },
      { label: 'Conversion Rate', value: '22.1%', change: '-1.1%', trend: 'down', icon: Target },
      { label: 'Revenue Generated', value: '$345,000', change: '+12.4%', trend: 'up', icon: TrendingUp },
      { label: 'Avg. Deal Value', value: '$6,120', change: '+4.2%', trend: 'up', icon: BarChart3 },
    ]
  },
  '90D': {
    weeklyData: [
      { name: 'Month 1', leads: 180, deals: 45, revenue: 120000 },
      { name: 'Month 2', leads: 210, deals: 55, revenue: 150000 },
      { name: 'Month 3', leads: 250, deals: 70, revenue: 190000 },
    ],
    kpis: [
      { label: 'Total Leads', value: '1,842', change: '+14.4%', trend: 'up', icon: Users },
      { label: 'Conversion Rate', value: '25.8%', change: '+3.1%', trend: 'up', icon: Target },
      { label: 'Revenue Generated', value: '$1.2M', change: '+22.4%', trend: 'up', icon: TrendingUp },
      { label: 'Avg. Deal Value', value: '$5,900', change: '+1.2%', trend: 'up', icon: BarChart3 },
    ]
  },
  '1Y': {
    weeklyData: [
      { name: 'Q1', leads: 500, deals: 120, revenue: 350000 },
      { name: 'Q2', leads: 620, deals: 150, revenue: 420000 },
      { name: 'Q3', leads: 580, deals: 140, revenue: 390000 },
      { name: 'Q4', leads: 750, deals: 190, revenue: 510000 },
    ],
    kpis: [
      { label: 'Total Leads', value: '7,250', change: '+42.4%', trend: 'up', icon: Users },
      { label: 'Conversion Rate', value: '24.2%', change: '+1.1%', trend: 'up', icon: Target },
      { label: 'Revenue Generated', value: '$4.8M', change: '+55.4%', trend: 'up', icon: TrendingUp },
      { label: 'Avg. Deal Value', value: '$6,250', change: '+5.2%', trend: 'up', icon: BarChart3 },
    ]
  }
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7D');
  const currentData = dataSets[range] || dataSets['7D'];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">Analytics</h1>
          <p className="text-slate-500 dark:text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">Real-time performance metrics and revenue intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {['7D', '30D', '90D', '1Y'].map(p => (
            <button 
              key={p} 
              onClick={() => {
                setRange(p);
                toast(`Time range updated to ${p}`, { icon: '📅' });
              }}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all ${p === range ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' : 'text-slate-500 dark:text-[#b9cacb] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300">
        {currentData.kpis.map((k: any) => (
          <div key={k.label} className="glass-card p-4 group hover:border-[#00f0ff]/30 dark:hover:border-[#00f0ff]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00f0ff]/5 blur-2xl -translate-y-8 translate-x-8" />
            <div className="flex items-start justify-between mb-3">
              <p className="text-[9px] font-black text-slate-500 dark:text-[#b9cacb] uppercase tracking-[0.2em]">{k.label}</p>
              <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded ${k.trend === 'up' ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10'}`}>
                {k.trend === 'up' ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                {k.change}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tighter">{k.value}</h3>
              <k.icon size={18} className="text-[#00f0ff]/60" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6">Lead Acquisition</h3>
          <div className="h-[200px] transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.weeklyData}>
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
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6">Revenue by Day</h3>
          <div className="h-[200px] transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
                <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(189,0,255,0.1)', borderRadius: '10px', fontSize: '11px' }} />
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bd00ff" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>
                </defs>
                <Bar dataKey="revenue" fill="url(#gRevenue)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
