'use client'
import React from 'react'
import { X, Zap, Target, TrendingUp, AlertCircle, Bot } from 'lucide-react'

export default function AIInsightsModal({ lead, onClose }: { lead: any, onClose: () => void }) {
  if (!lead) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-xl overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Zap size={16} className="text-[#00f0ff]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white light:text-slate-800 tracking-tight uppercase">AI Intelligence Dossier</h2>
              <p className="text-[10px] text-[#00f0ff] uppercase tracking-widest mt-0.5 font-bold">Subject: {lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00f0ff]/10 blur-xl rounded-full" />
              <Target size={14} className="text-[#00f0ff] mb-2" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Intent</p>
              <h3 className="text-2xl font-bold text-white light:text-slate-900 mt-1">{lead.score}%</h3>
            </div>
            <div className="p-4 rounded-xl border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#bd00ff]/10 blur-xl rounded-full" />
              <TrendingUp size={14} className="text-[#bd00ff] mb-2" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement Trajectory</p>
              <h3 className="text-lg font-bold text-emerald-400 mt-1">Accelerating</h3>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Behavioral Analysis</h4>
            <div className="p-4 rounded-xl border border-[#00f0ff]/20 bg-[#00f0ff]/5 space-y-3">
              <p className="text-sm text-slate-300 light:text-slate-700 leading-relaxed">
                <strong className="text-white light:text-slate-900">High engagement detected</strong> across {lead.source} channels. The prospect has reviewed the pricing page 3 times in the last 48 hours and clicked the primary CTA in the recent email campaign.
              </p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-black/40 light:bg-white/60">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 light:text-slate-600 italic">
                  Competitor mentions found in recent WhatsApp exchanges. Emphasize unique value proposition in next touchpoint.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Strategic Recommendation</h4>
            <button className="w-full p-4 rounded-xl border border-[#bd00ff]/30 bg-[#bd00ff]/10 hover:bg-[#bd00ff]/20 transition-all text-left group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#bd00ff]" />
                  <span className="text-xs font-bold text-white light:text-slate-900 uppercase">Draft personalized proposal</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-1 rounded bg-[#bd00ff] text-white uppercase tracking-widest group-hover:scale-105 transition-transform">1-Click Generate</span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600">The AI Copilot has prepared a highly personalized email draft focusing on ROI tailored to {lead.company}'s industry.</p>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
