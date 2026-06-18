import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal,
  Mail,
  Linkedin,
  Globe,
  Star,
  ChevronDown,
  ArrowRight,
  Zap,
  Bot,
  X,
  MessageSquare,
  Facebook,
  Sparkles
} from 'lucide-react';
import { mockLeads, mockAIInsights } from '../mockData';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LeadStatus, Lead } from '../types';
import LeadAIPulse from '../components/LeadAIPulse';

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  unqualified: 'bg-slate-100 text-slate-700',
  converted: 'bg-brand-100 text-brand-700',
};

const SourceIcon = ({ source }: { source: Lead['source'] }) => {
  switch (source) {
    case 'WhatsApp': return <MessageSquare size={14} className="text-emerald-500" />;
    case 'Email': return <Mail size={14} className="text-blue-500" />;
    case 'Meta Leads': return <Facebook size={14} className="text-brand-600" />;
    case 'LinkedIn': return <Linkedin size={14} className="text-blue-600" />;
    default: return <Globe size={14} className="text-slate-400" />;
  }
};

export default function LeadList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leadForAI, setLeadForAI] = useState<Lead | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);

  const filteredLeads = mockLeads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const leadAIInsight = leadForAI ? mockAIInsights.find(i => i.leadId === leadForAI.id) : null;

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Lead Universe</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Multi-channel leads synchronized via AI Automation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary h-10 flex items-center gap-2">
            <Download size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Export</span>
          </button>
          <button 
            onClick={() => setShowAddLead(true)}
            className="btn-primary h-10 flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Plus size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Add Lead</span>
          </button>
        </div>
      </header>

      {/* Filters & Actions */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
             {['All', 'WhatsApp', 'Meta', 'Email'].map(channel => (
               <button key={channel} className="text-[10px] font-black uppercase px-3 py-1 rounded hover:bg-white transition-all text-slate-500 hover:text-slate-900 tracking-widest">{channel}</button>
             ))}
          </div>
          <button className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Lead Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
                    checked={selectedLeads.length === filteredLeads.length}
                    onChange={() => setSelectedLeads(selectedLeads.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id))}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Pulse</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <motion.tr 
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setLeadForAI(lead)}
                  className={cn(
                    "group hover:bg-slate-50 transition-colors cursor-pointer",
                    selectedLeads.includes(lead.id) && "bg-brand-50/30",
                    leadForAI?.id === lead.id && "bg-brand-50/50 ring-1 ring-inset ring-brand-200"
                  )}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 mx-auto block" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${lead.name}`} className="w-10 h-10 object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{lead.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <SourceIcon source={lead.source} />
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{lead.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", statusColors[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            lead.score > 80 ? "bg-emerald-500" : lead.score > 50 ? "bg-amber-500" : "bg-rose-500"
                          )} 
                          style={{ width: `${lead.score}%` }} 
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className={cn(lead.score > 80 ? "text-emerald-500" : "text-slate-300")} />
                        <span className="text-[10px] font-black text-slate-900">{lead.score}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="View AI Insights">
                        <Zap size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Hub Synchronized</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50" disabled>Prev</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest active:bg-brand-50">1</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">2</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
      
      {/* Selection Action Bar - Animated Presence */}
      <AnimatePresence>
        {selectedLeads.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-8 border border-white/10 min-w-[500px]"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
               <span className="bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter">{selectedLeads.length}</span>
               <span className="text-xs font-black uppercase tracking-widest text-slate-300">Selected</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-400 transition-colors">
                <Zap size={14} />
                <span>AI Batch Outreach</span>
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-400 transition-colors">
                <Users size={14} />
                <span>Assign</span>
              </button>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-rose-400 transition-colors">
                <span>Remove</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Side Panel */}
      <AnimatePresence>
        {leadForAI && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-[400px] z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">AI Pulse</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{leadForAI.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setLeadForAI(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {leadAIInsight ? (
                <LeadAIPulse 
                  lead={leadForAI} 
                  insight={leadAIInsight} 
                  onExecuteAutomation={() => {
                    alert(`AI Automation triggered for ${leadForAI.name}! Source: ${leadForAI.source}`);
                    setLeadForAI(null);
                  }} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 animate-pulse">
                    <Bot size={32} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Gathering Intelligence</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 italic">
                      Gemini is currently crawling Meta Ads and LinkedIn profiles to generate a strategic plan.
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-200 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddLead && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddLead(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Manual Entry</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Add a single lead to the universe</p>
                   </div>
                   <button onClick={() => setShowAddLead(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                      <X size={20} />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                         <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                         <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500" placeholder="john@example.com" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</label>
                         <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500" placeholder="Acme Inc" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Source</label>
                         <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 appearance-none">
                            <option>Manual Import</option>
                            <option>WhatsApp</option>
                            <option>Email</option>
                            <option>LinkedIn</option>
                            <option>Meta Ads</option>
                         </select>
                      </div>
                   </div>
                   <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex items-start gap-4">
                      <Bot size={20} className="text-brand-600 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-brand-700 tracking-widest leading-none mb-1">AI Audit Enabled</p>
                         <p className="text-[10px] text-brand-600/80 font-medium leading-relaxed italic">Once added, Gemini will automatically audit this lead and generate a custom outreach strategy.</p>
                      </div>
                   </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                   <button onClick={() => setShowAddLead(false)} className="btn-secondary px-6">Cancel</button>
                   <button className="btn-primary px-10 shadow-lg shadow-brand-500/10" onClick={() => setShowAddLead(false)}>Create Lead</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
