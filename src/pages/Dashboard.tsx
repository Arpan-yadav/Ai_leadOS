import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MoreVertical,
  Bot
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { mockLeads, mockDeals, mockTasks } from '../mockData';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total Revenue', value: '$124,500', change: '+12.5%', trend: 'up', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Leads', value: '842', change: '+3.2%', trend: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Conversion Rate', value: '24.2%', change: '-1.4%', trend: 'down', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Pipeline Value', value: '$452,000', change: '+22.4%', trend: 'up', icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
];

const chartData = [
  { name: 'Mon', revenue: 4000, leads: 24 },
  { name: 'Tue', revenue: 3000, leads: 13 },
  { name: 'Wed', revenue: 5000, leads: 38 },
  { name: 'Thu', revenue: 2780, leads: 20 },
  { name: 'Fri', revenue: 6890, leads: 52 },
  { name: 'Sat', revenue: 2390, leads: 15 },
  { name: 'Sun', revenue: 3490, leads: 22 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const sourceData = [
  { name: 'WhatsApp', value: 45, color: '#10b981' },
  { name: 'Email', value: 32, color: '#3b82f6' },
  { name: 'Meta Ads', value: 25, color: '#4f46e5' },
  { name: 'LinkedIn', value: 18, color: '#0ea5e9' },
  { name: 'Referral', value: 12, color: '#f59e0b' },
];

export default function Dashboard() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">Global Intelligence</h1>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.2em] animate-pulse">Syncing Sources...</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary h-8 flex items-center gap-2">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Real-time</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="glass-card p-4 group hover:border-brand-300 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-[40px] -translate-y-12 translate-x-12" />
            <div className="flex items-start justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter ${stat.trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
              <div className={cn("text-xs", stat.color)}>
                 <stat.icon size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">Intelligence Performance</h3>
            <div className="flex items-center gap-4">
               {['Revenue', 'Leads'].map(t => (
                 <div key={t} className="flex items-center gap-1.5">
                   <div className={cn("w-2 h-2 rounded-full", t === 'Revenue' ? 'bg-indigo-600' : 'bg-slate-300')} />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t}</span>
                 </div>
               ))}
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #f1f5f9', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                    padding: '8px',
                    fontSize: '10px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Lead Source Breakdown */}
        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800 mb-8">Lead Origin Map</h3>
          <div className="flex-1 space-y-6">
            {sourceData.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-600">{source.name}</span>
                  <span className="text-slate-900">{source.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${source.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=User${i}`} alt="" />
                  </div>
                ))}
             </div>
             <p className="text-[10px] font-bold text-slate-400 italic">8 newly captured today</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
        {/* Recent Activities */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">Intelligence Log</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700">View Feed</button>
          </div>
          <div className="space-y-6">
            {mockLeads.slice(0, 4).map((lead, i) => (
              <div key={lead.id} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 shrink-0 group-hover:border-brand-200 transition-colors">
                  <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${lead.name}`} className="w-10 h-10 object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {lead.name} <span className="font-medium text-slate-400 capitalize">from</span> {lead.company}
                  </p>
                  <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest mt-1">Source: {lead.source}</p>
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest pt-1">
                  {i === 0 ? 'Recently' : '2h ago'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={itemVariants} className="glass-card p-6 border-indigo-100 bg-indigo-50/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-indigo-600" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">Strategic Recommendations</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-brand-500 transition-all cursor-pointer group active:scale-[0.98]">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">High Intent Detected</p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase leading-snug">Meta Ad Response: Globus Logistics</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-medium italic leading-relaxed">System suggests immediate WhatsApp outreach based on urgent logistic inquiry pattern.</p>
            </div>
            
            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-brand-500 transition-all cursor-pointer group active:scale-[0.98]">
               <div className="flex justify-between items-start mb-2">
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Strategy Optimized</p>
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase leading-snug">Email Follow-up: TechCorp</h4>
              <p className="text-[10px] text-slate-500 mt-2 font-medium italic leading-relaxed">AI has drafted a CTO-personalized proposal. Ready for one-click deployment.</p>
            </div>
          </div>
          <button className="w-full btn-primary bg-indigo-600 text-[10px] uppercase tracking-[0.2em] font-black mt-8 flex items-center justify-center gap-2 py-3 shadow-xl shadow-indigo-600/10">
            <Bot size={14} />
            <span>Engage AI Automation</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
