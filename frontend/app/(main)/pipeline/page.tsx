'use client';
/**
 * @file app/(main)/pipeline/page.tsx
 * @description Kanban Pipeline Page — Sprint 3, Frontend Team (Harshwardhan)
 * Features: react-beautiful-dnd drag-and-drop, live API data, stage transitions
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Filter, LayoutGrid, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { getToken } from '@/lib/auth';

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
  { id: 'DISCOVERY',   label: 'Discovery',   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  { id: 'PROPOSAL',    label: 'Proposal',    color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200' },
  { id: 'CLOSING',     label: 'Closing',     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  { id: 'WON',         label: 'Closed Won',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'LOST',        label: 'Lost',        color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({ deal, index }: { deal: Deal; index: number }) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all group
            ${snapshot.isDragging ? 'shadow-lg rotate-1 border-indigo-300 scale-105' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
        >
          {/* Deal ID Badge */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">#{deal.id.slice(0, 8)}</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded uppercase">AI Scored</span>
          </div>

          {/* Company name */}
          <h4 className="font-bold text-xs text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors mb-0.5 truncate">
            {deal.lead?.company ?? 'Unknown'}
          </h4>
          <p className="text-[10px] text-slate-500 mb-2 truncate">{deal.title}</p>

          {/* Amount */}
          <div className="flex items-center gap-1 mb-3">
            <DollarSign size={10} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">{formatCurrency(deal.amount)}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${deal.lead?.name ?? 'Lead'}&backgroundType=gradientLinear`}
              className="w-5 h-5 rounded-full border border-white shadow-sm"
              alt=""
            />
            <span className="text-[9px] text-slate-400 italic">Sales</span>
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

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3001/deals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch deals');
      const data = await res.json();
      setDeals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  const getDealsByStage = (stage: DealStage) => deals.filter(d => d.stage === stage);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStage = destination.droppableId as DealStage;

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === draggableId ? { ...d, stage: newStage } : d));
    setUpdating(draggableId);

    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3001/deals/${draggableId}/stage`, {
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
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-800">Sales Pipeline</h1>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live View
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 mr-2">
            <span>Total Pipeline: <strong className="text-slate-700">{formatCurrency(totalValue)}</strong></span>
            <span>Won: <strong className="text-emerald-600">{formatCurrency(wonValue)}</strong></span>
          </div>
          <button onClick={fetchDeals} className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all">
            <RefreshCw size={14} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
            <Plus size={14} />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm flex-shrink-0">
          ⚠️ {error} — Is the backend running on port 3001?
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
                  <div className={`flex items-center justify-between mb-3 px-2 py-1.5 rounded-lg ${stage.bg} border ${stage.border}`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-[10px] uppercase tracking-widest ${stage.color}`}>
                        {stage.label}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color} border ${stage.border}`}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{formatCurrency(stageTotalAmount)}</span>
                  </div>

                  {/* Droppable Column */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2.5 p-2 rounded-lg min-h-[200px] transition-colors
                          ${snapshot.isDraggingOver ? 'bg-indigo-50/80 border-2 border-dashed border-indigo-300' : 'bg-slate-50/50'}`}
                      >
                        {stageDeals.map((deal, index) => (
                          <DealCard key={deal.id} deal={deal} index={index} />
                        ))}

                        {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-16 border border-dashed border-slate-200 rounded-lg text-slate-300">
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
    </div>
  );
}
