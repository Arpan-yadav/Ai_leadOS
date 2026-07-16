'use client';
/**
 * @file app/(main)/pipeline/page.tsx
 * @description Kanban Pipeline Page — Sprint 3, Frontend Team
 * Features: react-beautiful-dnd drag-and-drop, live API data, stage transitions
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Filter, LayoutGrid, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';
import AddDealModal from '@/components/pipeline/AddDealModal';
import DealDetailModal from '@/components/pipeline/DealDetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type DealStage = 'DISCOVERY' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSING' | 'WON' | 'LOST';

interface Lead {
  id: string;
  name: string;
  company: string;
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: DealStage;
  lead: Lead;
  ownerId: string;
  createdAt: string;
}

// ─── Stage Config ─────────────────────────────────────────────────────────────
const STAGES: { id: DealStage; label: string; color: string; bg: string; border: string }[] = [
  { id: 'DISCOVERY',   label: 'Discovery',   color: 'text-[#00f0ff] light:text-blue-600',    bg: 'bg-[#00f0ff]/10 light:bg-blue-50',    border: 'border-[#00f0ff]/20 light:border-blue-200' },
  { id: 'PROPOSAL',    label: 'Proposal',    color: 'text-[#bd00ff] light:text-indigo-600',  bg: 'bg-[#bd00ff]/10 light:bg-indigo-50',  border: 'border-[#bd00ff]/20 light:border-indigo-200' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'text-[#ff007a] light:text-violet-600',  bg: 'bg-[#ff007a]/10 light:bg-violet-50',  border: 'border-[#ff007a]/20 light:border-violet-200' },
  { id: 'CLOSING',     label: 'Closing',     color: 'text-amber-500 light:text-amber-600',   bg: 'bg-amber-500/10 light:bg-amber-50',   border: 'border-amber-500/20 light:border-amber-200' },
  { id: 'WON',         label: 'Closed Won',  color: 'text-emerald-500 light:text-emerald-600', bg: 'bg-emerald-500/10 light:bg-emerald-50', border: 'border-emerald-500/20 light:border-emerald-200' },
  { id: 'LOST',        label: 'Lost',        color: 'text-rose-500 light:text-red-600',     bg: 'bg-rose-500/10 light:bg-red-50',     border: 'border-rose-500/20 light:border-red-200' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal, index, onClick }: { deal: Deal; index: number; onClick: () => void }) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`glass-card p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all group
            ${snapshot.isDragging ? 'shadow-[0_0_20px_rgba(0,240,255,0.3)] rotate-2 scale-105 border-[#00f0ff]' : 'border-[#27272A] light:border-slate-200 hover:border-[#bd00ff]/50 light:hover:border-indigo-300'}`}
        >
          {/* Deal ID Badge */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-mono font-bold text-[#b9cacb] light:text-indigo-400 uppercase">#{deal.id.slice(0, 8)}</span>
            <span className="text-[9px] bg-[#bd00ff]/10 light:bg-indigo-50 text-[#bd00ff] light:text-indigo-600 font-bold px-1.5 py-0.5 rounded uppercase">AI Scored</span>
          </div>

          {/* Company name */}
          <h4 className="font-bold text-xs text-white light:text-slate-800 leading-tight group-hover:text-[#00f0ff] light:group-hover:text-indigo-700 transition-colors mb-0.5 truncate">
            {deal.lead?.company ?? 'Unknown'}
          </h4>
          <p className="text-[10px] text-[#b9cacb] light:text-slate-500 mb-2 truncate">{deal.title}</p>

          {/* Amount */}
          <div className="flex items-center gap-1 mb-3">
            <DollarSign size={10} className="text-emerald-400 light:text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 light:text-emerald-600">{formatCurrency(deal.amount)}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 light:border-slate-100">
            <div className="w-5 h-5 rounded-full bg-[#111114] light:bg-slate-100 border border-[#27272A] light:border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-[#00f0ff] light:text-indigo-600">
              {(deal.lead?.name ?? 'L').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[9px] text-[#b9cacb] light:text-slate-400 italic">Sales</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterMinValue, setFilterMinValue] = useState<number>(0);
  const [filterAiScored, setFilterAiScored] = useState<boolean>(false);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch deals');
      const data = await res.json();
      // API may return array directly or wrapped in {data: []}
      const list = Array.isArray(data) ? data : (data.data ?? data.deals ?? []);
      setDeals(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const filteredDeals = deals.filter(d => {
    const textMatch = d.title.toLowerCase().includes(filterText.toLowerCase()) || 
                      (d.lead?.company || '').toLowerCase().includes(filterText.toLowerCase());
    const stageMatch = filterStage === 'ALL' || d.stage === filterStage;
    const valueMatch = d.amount >= filterMinValue;
    const aiScoredMatch = !filterAiScored || true; // Currently all have AI Scored badge in mock UI, but conceptually filtering for it.
    
    return textMatch && stageMatch && valueMatch && aiScoredMatch;
  });

  const getDealsByStage = (stageId: string) => {
    return filteredDeals.filter(d => d.stage === stageId).sort((a, b) => b.amount - a.amount);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStage = destination.droppableId as DealStage;

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === draggableId ? { ...d, stage: newStage } : d));
    setUpdating(draggableId);

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3001/api/deals/${draggableId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error('Stage update failed');
    } catch {
      // Revert on error
      fetchDeals();
    } finally {
      setUpdating(null);
    }
  };

  const totalValue = deals.reduce((sum, d) => sum + d.amount, 0);
  const wonValue = deals.filter(d => d.stage === 'WON').reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00f0ff] light:text-indigo-500 animate-spin" />
          <p className="text-sm text-[#b9cacb] light:text-slate-500">Loading Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white light:text-slate-800">Sales Pipeline</h1>
          <span className="text-[10px] bg-[#00f0ff]/10 light:bg-indigo-100 text-[#00f0ff] light:text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#00f0ff]/20 light:border-transparent">
            Live View
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-[#b9cacb] light:text-slate-500 mr-2">
            <span>Total Pipeline: <strong className="text-white light:text-slate-700">{formatCurrency(totalValue)}</strong></span>
            <span>Won: <strong className="text-emerald-400 light:text-emerald-600">{formatCurrency(wonValue)}</strong></span>
          </div>
          <button onClick={fetchDeals} className="p-1.5 rounded-lg border border-[#27272A] light:border-slate-200 text-[#b9cacb] light:text-slate-500 hover:text-[#00f0ff] light:hover:text-indigo-600 hover:border-[#00f0ff]/50 light:hover:border-indigo-200 transition-all bg-[#111114] light:bg-transparent">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${showFilters ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30' : 'bg-[#111114] light:bg-transparent border-[#27272A] light:border-slate-200 text-[#e5e1e4] light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-50'}`}>
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button onClick={() => setIsAddDealModalOpen(true)} className="btn-primary">
            <Plus size={14} className="mr-2" />
            New Deal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg p-3 text-sm shrink-0">
          ⚠️ {error} — Is the backend running on port 3001?
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-4 rounded-lg border border-[#27272A] light:border-slate-200 shrink-0 animate-slide-down flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-[#b9cacb] uppercase tracking-wider mb-1">Search</label>
            <input
              type="text"
              placeholder="Title or company..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="input-field w-full"
              autoFocus
            />
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-bold text-[#b9cacb] uppercase tracking-wider mb-1">Stage</label>
            <select className="input-field w-full" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
              <option value="ALL">All Stages</option>
              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-[10px] font-bold text-[#b9cacb] uppercase tracking-wider mb-1">Min Value</label>
            <input
              type="number"
              placeholder="$0"
              value={filterMinValue || ''}
              onChange={(e) => setFilterMinValue(Number(e.target.value))}
              className="input-field w-full"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="ai-scored"
              checked={filterAiScored}
              onChange={(e) => setFilterAiScored(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272A] text-[#bd00ff] focus:ring-[#bd00ff]"
            />
            <label htmlFor="ai-scored" className="text-xs font-bold text-white light:text-slate-700">AI Scored Only</label>
          </div>
        </div>
      )}

      {/* Kanban Board with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {STAGES.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              const stageTotalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

              return (
                <div key={stage.id} className="w-64 flex flex-col">
                  {/* Column Header */}
                  <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg ${stage.bg} border ${stage.border} shadow-[0_0_15px_rgba(0,0,0,0.2)] light:shadow-none`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-[10px] uppercase tracking-widest ${stage.color}`}>
                        {stage.label}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color} border ${stage.border}`}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#b9cacb] light:text-slate-400 font-medium">{formatCurrency(stageTotalAmount)}</span>
                  </div>

                  {/* Droppable Column */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2.5 p-2 rounded-xl min-h-[200px] transition-colors border
                          ${snapshot.isDraggingOver ? 'bg-[#111114]/80 border-2 border-dashed border-[#00f0ff] light:bg-indigo-50/80 light:border-indigo-300' : 'bg-[#111114]/40 border-transparent light:bg-slate-50/50'}`}
                      >
                        {stageDeals.map((deal, index) => (
                          <DealCard 
                            key={deal.id} 
                            deal={deal} 
                            index={index} 
                            onClick={() => setSelectedDeal(deal)}
                          />
                        ))}

                        {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-16 border border-dashed border-white/10 light:border-slate-200 rounded-lg text-[#b9cacb]/50 light:text-slate-300">
                            <Plus size={16} className="opacity-50" />
                          </div>
                        )}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {isAddDealModalOpen && (
        <AddDealModal 
          onClose={() => setIsAddDealModalOpen(false)}
          onAdd={(newDeal: any) => {
            setIsAddDealModalOpen(false);
            setDeals(prev => [...prev, newDeal]);
          }}
        />
      )}

      {selectedDeal && (
        <DealDetailModal 
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
