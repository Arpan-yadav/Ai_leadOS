'use client'
import React, { useState } from 'react'
import { X, Play, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ActivateWorkflowModal({ onClose, onActivate }: { onClose: () => void, onActivate: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000))
    toast.success('Workflow Activated successfully!')
    onActivate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-r from-[#00f0ff]/20 to-[#bd00ff]/20 flex items-center justify-center">
              <Zap size={16} className="text-[#00f0ff]" />
            </div>
            <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Activate Workflow</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Going Live</h4>
              <p className="text-sm">Activating this workflow will immediately begin processing triggers and potentially sending communications to leads.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Run Frequency</label>
              <select className="input-field appearance-none">
                <option>Real-time (On Event)</option>
                <option>Hourly Batch</option>
                <option>Daily at 9:00 AM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Fail-safe Limits</label>
              <select className="input-field appearance-none">
                <option>Max 100 actions / day</option>
                <option>Max 500 actions / day</option>
                <option>Unlimited</option>
              </select>
            </div>
            
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] light:border-slate-200 cursor-pointer hover:border-[#00f0ff]/50 transition-colors">
                <input type="checkbox" defaultChecked className="rounded border-[#27272A] bg-[#111114] text-[#00f0ff] focus:ring-[#00f0ff]" />
                <div>
                  <div className="text-sm font-bold text-white light:text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Enable AI Guardrails
                  </div>
                  <div className="text-[10px] text-[#b9cacb] light:text-slate-500 mt-1">Prevents contradictory or rapid consecutive messages to the same lead.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button 
            onClick={handleActivate} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#00f0ff] to-[#bd00ff] text-white hover:opacity-90 transition-opacity font-bold text-sm shadow-[0_0_20px_rgba(189,0,255,0.4)] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={16} className="fill-current" />}
            Activate Now
          </button>
        </div>

      </div>
    </div>
  )
}
