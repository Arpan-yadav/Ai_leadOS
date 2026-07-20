'use client'
import React from 'react'
import { X, Zap, Target, TrendingUp, AlertCircle, Bot } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AIInsightsModal({ lead, onClose }: { lead: any, onClose: () => void }) {
  const [insight, setInsight] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!lead) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/leads/${lead.id}/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setInsight(data))
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [lead]);

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
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#b9cacb] light:text-slate-500">
              <div className="animate-spin mb-4"><Zap size={24} className="text-[#bd00ff]" /></div>
              <p className="text-xs uppercase tracking-widest font-black">AI is analyzing prospect data...</p>
            </div>
          ) : insight ? (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#00f0ff]/10 blur-xl rounded-full" />
                  <Target size={14} className="text-[#00f0ff] mb-2" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quality Score</p>
                  <h3 className="text-2xl font-bold text-white light:text-slate-900 mt-1">{insight.qualityScore || lead.score}%</h3>
                </div>
                <div className="p-4 rounded-xl border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#bd00ff]/10 blur-xl rounded-full" />
                  <TrendingUp size={14} className="text-[#bd00ff] mb-2" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment</p>
                  <h3 className="text-lg font-bold text-emerald-400 mt-1 capitalize">{insight.sentiment || 'Neutral'}</h3>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Behavioral Analysis</h4>
                <div className="p-4 rounded-xl border border-[#00f0ff]/20 bg-[#00f0ff]/5 space-y-3">
                  <p className="text-sm text-slate-300 light:text-slate-700 leading-relaxed">
                    {insight.analysis}
                  </p>
                  {insight.nextAction && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-black/40 light:bg-white/60">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-400 light:text-slate-600 italic">
                        <strong className="text-white light:text-slate-900 not-italic">Recommended Next Action: </strong>
                        {insight.nextAction}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Failed to load insights.</div>
          )}

        </div>
      </div>
    </div>
  )
}
