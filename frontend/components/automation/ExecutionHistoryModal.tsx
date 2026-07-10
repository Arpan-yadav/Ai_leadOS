import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react'

const initialDummyHistory = [
  { id: 'run-001', status: 'SUCCESS', time: '10 mins ago', duration: '1.2s', triggeredBy: 'New Lead: John Doe' },
  { id: 'run-002', status: 'SUCCESS', time: '1 hour ago', duration: '0.8s', triggeredBy: 'Score updated > 80' },
  { id: 'run-003', status: 'FAILED', time: '3 hours ago', duration: '2.4s', triggeredBy: 'API Webhook' },
  { id: 'run-004', status: 'SUCCESS', time: 'Yesterday', duration: '1.1s', triggeredBy: 'New Lead: Sarah Jenkins' },
  { id: 'run-005', status: 'SUCCESS', time: 'Yesterday', duration: '1.5s', triggeredBy: 'Score updated > 80' },
]

export default function ExecutionHistoryModal({ onClose, mockNewExecution }: { onClose: () => void, mockNewExecution?: boolean }) {
  const [history, setHistory] = useState(initialDummyHistory);

  useEffect(() => {
    if (mockNewExecution) {
      const newRun = {
        id: `run-${Math.floor(Math.random() * 1000)}`,
        status: 'SUCCESS',
        time: 'Just now',
        duration: '0.4s',
        triggeredBy: 'Manual Activation Test'
      };
      setHistory([newRun, ...initialDummyHistory]);
    }
  }, [mockNewExecution]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Execution History</h2>
            <p className="text-[10px] text-[#b9cacb] light:text-slate-500 uppercase tracking-widest mt-1">Review past workflow runs and logs</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tools */}
        <div className="px-6 py-3 border-b border-white/5 light:border-slate-100 flex items-center gap-4 bg-black/10 light:bg-slate-50/30 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Search logs..." className="input-field pl-9 py-1.5 text-xs w-full max-w-sm" />
          </div>
          <button className="btn-secondary flex items-center gap-2 py-1.5 px-3">
            <Filter size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filter</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {history.map((run) => (
              <div key={run.id} className="glass-card p-4 flex items-center justify-between hover:border-[#00f0ff]/30 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${run.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {run.status === 'SUCCESS' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white light:text-slate-800 group-hover:text-[#00f0ff] transition-colors">{run.triggeredBy}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {run.time}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">ID: {run.id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{run.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
