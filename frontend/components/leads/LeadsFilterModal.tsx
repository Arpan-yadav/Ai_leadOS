'use client'
import React, { useState } from 'react'
import { X, SlidersHorizontal, Filter, RefreshCcw } from 'lucide-react'

export default function LeadsFilterModal({ onClose }: { onClose: () => void }) {
  const [aiScore, setAiScore] = useState(50)
  
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex animate-slide-left">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" onClick={onClose} />
      <div className="w-80 h-full bg-[#0A0A0C] light:bg-white border-l border-[#27272A] light:border-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#27272A] light:border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#00f0ff]" />
            <h2 className="font-bold text-white light:text-slate-900 tracking-tight uppercase text-sm">Advanced Filters</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Min AI Score</label>
              <span className="text-xs font-bold text-[#00f0ff]">{aiScore}+</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={aiScore} 
              onChange={e => setAiScore(Number(e.target.value))}
              className="w-full accent-[#00f0ff]"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-500">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Lead Status</label>
            <div className="space-y-2">
              {['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED'].map(status => (
                <label key={status} className="flex items-center gap-3 p-2 rounded border border-transparent hover:border-white/10 light:hover:border-slate-200 cursor-pointer transition-colors group">
                  <input type="checkbox" className="rounded border-slate-700 bg-transparent text-[#00f0ff] focus:ring-[#00f0ff]" />
                  <span className="text-xs font-bold text-slate-300 light:text-slate-700 group-hover:text-white transition-colors">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Origin Source</label>
            <div className="flex flex-wrap gap-2">
              {['LinkedIn', 'Email', 'WhatsApp', 'Meta', 'Referral'].map(src => (
                <button key={src} className="px-3 py-1.5 rounded-full border border-[#27272A] light:border-slate-300 text-[10px] font-bold text-slate-400 hover:text-white hover:border-[#00f0ff] transition-colors">
                  {src}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#27272A] light:border-slate-200 flex gap-3">
          <button className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2">
            <RefreshCcw size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
          </button>
          <button onClick={onClose} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2 bg-[#00f0ff] text-slate-900 hover:bg-[#00d0dd]">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Apply</span>
          </button>
        </div>

      </div>
    </div>
  )
}
