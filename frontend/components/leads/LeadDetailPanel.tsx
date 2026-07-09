'use client'
import React from 'react'
import StatusBadge from '../ui/StatusBadge'
import ScoreBadge from '../ui/ScoreBadge'

const LeadDetailPanel = ({ lead, onClose }: {
  lead: any
  onClose: () => void
}) => {

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-[#0A0A0C] border-l border-slate-200 dark:border-[#27272A] shadow-2xl dark:shadow-none z-50 p-6 overflow-y-auto transform transition-transform duration-300">
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Lead Intelligence</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#b9cacb] dark:hover:text-white dark:hover:bg-[#27272A] rounded-xl transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mb-8 p-6 glass-card bg-slate-50 dark:bg-transparent text-center relative overflow-hidden group border border-slate-200 dark:border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-[#00f0ff]/20 transition-colors" />
        <div className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-[#16161D] border-2 border-[#00f0ff]/50 flex items-center justify-center text-2xl font-display font-black text-[#00f0ff] mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {lead.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">{lead.name}</h3>
        <p className="text-slate-500 dark:text-[#b9cacb] text-sm mt-1 font-mono uppercase tracking-widest">{lead.title || "No title"}</p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-5 space-y-4 bg-white dark:bg-transparent border border-slate-200 dark:border-white/5">
          <h4 className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest border-b border-slate-100 dark:border-[#27272A] pb-2 mb-3">Core Data</h4>
          {[
            { label: "Company", value: lead.company },
            { label: "Email", value: lead.email },
            { label: "Phone", value: lead.phone || "Not provided" },
            { label: "Source", value: lead.source },
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-1">{item.label}</span>
              <span className="text-sm text-slate-900 dark:text-white font-bold">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="glass-panel p-5 bg-white dark:bg-transparent border border-slate-200 dark:border-white/5">
          <h4 className="text-[10px] font-mono font-bold text-[#bd00ff] uppercase tracking-widest border-b border-slate-100 dark:border-[#27272A] pb-2 mb-4">Pipeline Status</h4>
          
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-2">Current Stage</p>
              <StatusBadge status={lead.status} />
            </div>

            <div>
              <p className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-2">AI Conversion Score</p>
              <ScoreBadge score={lead.score} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailPanel