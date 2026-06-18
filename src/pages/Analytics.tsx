import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Target, 
  BarChart2, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

const revenueData = [
  { month: 'Jan', revenue: 45000, target: 40000 },
  { month: 'Feb', revenue: 52000, target: 40000 },
  { month: 'Mar', revenue: 48000, target: 45000 },
  { month: 'Apr', revenue: 61000, target: 45000 },
  { month: 'May', revenue: 55000, target: 50000 },
  { month: 'Jun', revenue: 67000, target: 50000 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45, color: '#4f46e5' },
  { name: 'Cold Outreach', value: 25, color: '#818cf8' },
  { name: 'Referrals', value: 20, color: '#c7d7ff' },
  { name: 'Website', value: 10, color: '#eef2ff' },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
       <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue Analytics</h1>
          <p className="text-slate-500 mt-1 font-medium italic underline decoration-slate-200">Real-time performance intelligence and conversion metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar size={18} />
            <span>Q3 2026</span>
          </button>
          <button className="btn-primary flex items-center justify-center w-12 h-10 px-0">
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Deal Size', value: '$8,420', trend: '+5.2%', icon: DollarSign, color: 'text-brand-600' },
          { label: 'Win Rate', value: '28.4%', trend: '+2.1%', icon: Target, color: 'text-emerald-600' },
          { label: 'LTV (Avg)', value: '$24,500', trend: '+1.4%', icon: TrendingUp, color: 'text-violet-600' },
          { label: 'Sales Cycle', value: '14 Days', trend: '-2 Days', icon: BarChart2, color: 'text-amber-600' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 bg-white hover:border-brand-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-slate-50", item.color)}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-widest">{item.trend}</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{item.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Revenue vs Target</h3>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-brand-500" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-slate-200" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target</span>
                </div>
             </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', padding: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie */}
        <div className="glass-card p-8 flex flex-col">
           <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-8">Lead Attribution</h3>
           <div className="flex-1 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="space-y-3 mt-6">
              {sourceData.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-700 tracking-tight">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-400">{item.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Footer Insight Card */}
      <div className="glass-card p-8 bg-brand-900 text-white relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-20 blur-[100px]" />
         <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-brand-300">
                 <Target size={20} />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Strategic Recommendation</span>
               </div>
               <h4 className="text-2xl font-bold tracking-tight">LinkedIn ROI is 2.4x higher than Cold Outreach.</h4>
               <p className="text-brand-200/70 max-w-xl font-medium tracking-tight">AI suggests reallocating $4,000 from the August cold outreach budget to high-intent LinkedIn prospecting modules.</p>
            </div>
            <button className="btn-primary bg-white text-brand-900 hover:bg-brand-50 hover:text-brand-600 transition-all shadow-2xl px-8 uppercase font-black text-xs tracking-widest whitespace-nowrap">Execute Strategy</button>
         </div>
      </div>
    </div>
  );
}
