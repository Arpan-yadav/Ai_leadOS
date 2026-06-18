import React from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  DollarSign,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal
} from 'lucide-react';
import { mockDeals, mockLeads } from '../mockData';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { DealStage } from '../types';

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'discovery', label: 'Discovery', color: 'bg-blue-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-indigo-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-violet-500' },
  { id: 'closing', label: 'Closing', color: 'bg-amber-500' },
  { id: 'won', label: 'Closed Won', color: 'bg-emerald-500' },
];

export default function Pipeline() {
  const getDealsByStage = (stage: DealStage) => mockDeals.filter(d => d.stage === stage);
  const getLeadName = (leadId: string) => mockLeads.find(l => l.id === leadId)?.company || 'Unknown';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <h1 className="text-lg font-bold text-slate-800">Sales Pipeline</h1>
           <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Live View</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded p-0.5 shadow-inner">
            <button className="p-1 px-2 rounded bg-white shadow-sm text-slate-900 border border-slate-200"><LayoutGrid size={14} /></button>
            <button className="p-1 px-2 rounded text-slate-400 hover:text-slate-600"><List size={14} /></button>
          </div>
          <button className="btn-secondary flex items-center gap-2 h-8">
             <Filter size={14} />
             <span>Filter</span>
          </button>
           <button className="btn-primary flex items-center gap-2 h-8">
            <Plus size={14} />
            <span>New Deal</span>
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex gap-6 h-full min-w-max px-1">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const totalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div key={stage.id} className="w-72 flex flex-col rounded-lg">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                    <h3 className="font-bold text-[10px] text-slate-800 uppercase tracking-widest">{stage.label} ({stageDeals.length})</h3>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                  {stageDeals.map((deal) => (
                    <motion.div 
                      key={deal.id}
                      layoutId={deal.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white p-3 rounded border border-slate-200 shadow-sm hover:border-brand-500 transition-all cursor-pointer group relative"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-brand-600 transition-colors uppercase truncate pr-4">{getLeadName(deal.leadId)}</h4>
                        <span className="text-[9px] font-mono font-bold text-indigo-500">#{deal.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-medium mb-3">Projected: {formatCurrency(deal.amount)}</p>

                      <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase">
                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Sales</span>
                        <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded italic">AI Scored</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex -space-x-1.5">
                           {[1, 2].map(i => (
                              <img 
                               key={i}
                               src={`https://api.dicebear.com/7.x/initials/svg?seed=Avatar${i + deal.id}&backgroundType=gradientLinear`} 
                               className="w-5 h-5 rounded-full border border-white bg-slate-50 shadow-xs"
                               alt=""
                             />
                           ))}
                         </div>
                         <span className="text-[9px] text-slate-400 font-medium italic">Active 2h ago</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {stageDeals.length === 0 && (
                     <div className="h-20 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 group hover:border-slate-400 transition-colors cursor-pointer bg-white/30">
                        <Plus size={16} className="opacity-50" />
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
