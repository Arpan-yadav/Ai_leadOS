'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Plus, Loader2, Workflow, ArrowRight, Play, Users, CheckCircle2 } from 'lucide-react';
import { getToken } from '@/lib/auth';
import WorkflowBuilderView from './WorkflowBuilderView';
import { useTheme } from 'next-themes';

export default function AutomationDashboardPage() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'builder'>('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<number | undefined>(undefined);
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const fetchWorkflows = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/workflows`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'dashboard') {
      fetchWorkflows(true);
      
      const interval = setInterval(() => {
        fetchWorkflows(false);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  if (viewMode === 'builder') {
    return (
      <div className="relative h-full flex flex-col">
        <WorkflowBuilderView 
          workflow={selectedWorkflow} 
          currentStep={selectedStep} 
          leadId={selectedLeadId}
          onBack={() => {
            setViewMode('dashboard');
            setSelectedWorkflow(null);
            setSelectedStep(undefined);
            setSelectedLeadId(undefined);
          }} 
        />
      </div>
    );
  }

  // Calculate colors
  const t = {
    bg: isDark ? 'bg-[#0A0A0C]' : 'bg-slate-50',
    card: isDark ? 'bg-[#111114] border-[#27272A] hover:border-[#bd00ff]/50' : 'bg-white border-slate-200 hover:border-[#bd00ff]/50',
    text: isDark ? 'text-white' : 'text-slate-900',
    subtext: isDark ? 'text-slate-400' : 'text-slate-500',
    header: isDark ? 'bg-[#0A0A0C] border-[#27272A]' : 'bg-white border-slate-200',
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] ${t.bg} p-6 flex flex-col animate-fade-in`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-widest ${t.text}`}>Automation Hub</h1>
          <p className={`text-sm mt-1 font-mono ${t.subtext}`}>Manage master workflows and enrolled leads</p>
        </div>
        <button onClick={() => setViewMode('builder')} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Create Workflow
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#bd00ff]" size={32} />
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          {workflows.map(wf => (
            <div key={wf.id} className={`rounded-2xl border ${t.card} overflow-hidden shadow-lg transition-all`}>
              {/* Workflow Header */}
              <div className="p-6 border-b border-[#27272A] light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#bd00ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(189,0,255,0.15)]">
                    <Workflow size={24} className="text-[#bd00ff]" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${t.text}`}>{wf.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${wf.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'} uppercase font-bold tracking-wider`}>
                        {wf.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`text-[11px] uppercase tracking-widest ${t.subtext}`}>
                        {wf._count?.executions || 0} Total Executions
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedWorkflow(wf);
                    setSelectedStep(undefined);
                    setViewMode('builder');
                  }}
                  className="px-4 py-2 border border-[#27272A] light:border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/5 light:hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Workflow size={14} />
                  View Architecture
                </button>
              </div>

              {/* Enrolled Leads */}
              <div className="p-6 bg-black/20 light:bg-slate-50">
                <h3 className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${t.subtext}`}>
                  <Users size={14} /> Currently Enrolled Leads
                </h3>
                
                {wf.executions?.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {wf.executions.map((exec: any) => (
                      <div 
                        key={exec.id} 
                        onClick={() => {
                          setSelectedWorkflow(wf);
                          setSelectedStep(exec.currentStep);
                          setSelectedLeadId(exec.leadId);
                          setViewMode('builder');
                        }}
                        className={`cursor-pointer p-4 rounded-xl border ${isDark ? 'border-[#27272A] bg-[#1a1a1f]' : 'border-slate-200 bg-white'} flex flex-col justify-between hover:border-[#00f0ff]/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all transform hover:-translate-y-1`}
                      >
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <p className={`font-bold ${t.text}`}>{exec.lead?.name || 'Unknown'}</p>
                            <p className={`text-[10px] uppercase tracking-wider ${t.subtext}`}>{exec.lead?.company || 'No Company'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                            exec.status === 'active' ? 'bg-[#00f0ff]/10 text-[#00f0ff]' :
                            exec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {exec.status}
                          </span>
                        </div>
                        
                        {/* Progress Tracker */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${t.subtext}`}>Workflow Progress</span>
                            <span className="text-xs font-black text-[#bd00ff]">Step {exec.currentStep}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 light:bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-linear-to-r from-[#00f0ff] to-[#bd00ff] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(10, (exec.currentStep / Math.max(1, wf.definition?.nodes?.length || 5)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 text-sm italic font-mono ${t.subtext}`}>
                    No active leads enrolled in this workflow yet.
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {workflows.length === 0 && (
             <div className="text-center py-20">
               <Workflow size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
               <h3 className={`text-lg font-bold mb-2 ${t.text}`}>No Workflows Found</h3>
               <p className={`text-sm ${t.subtext}`}>Create a new workflow or seed the database to get started.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
