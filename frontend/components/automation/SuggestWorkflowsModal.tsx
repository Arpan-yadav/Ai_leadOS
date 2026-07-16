import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

interface Suggestion {
  title: string;
  trigger: string;
  actions: string[];
  estimatedImpact: string;
}

interface Props {
  onClose: () => void;
  onApply: (suggestion: Suggestion) => void;
}

export default function SuggestWorkflowsModal({ onClose, onApply }: Props) {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/automation/suggestions`);
      if (context) {
        url.searchParams.append('context', context);
      }
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111114] light:bg-white w-full max-w-2xl rounded-2xl border border-[#27272A] light:border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272A] light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#bd00ff]/10 flex items-center justify-center shadow-[0_0_15px_rgba(189,0,255,0.2)]">
              <Sparkles size={20} className="text-[#bd00ff]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-900 uppercase tracking-widest">AI Suggest Workflows</h2>
              <p className="text-xs text-[#b9cacb] light:text-slate-500 font-mono">Generate high-impact automation ideas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white light:hover:text-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Context (Optional)</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. B2B SaaS targeting Marketing Agencies" 
                className="flex-1 bg-[#0A0A0C] light:bg-slate-50 border border-[#27272A] light:border-slate-200 rounded-lg px-4 py-2 text-white light:text-slate-900 focus:outline-none focus:border-[#00f0ff] transition-colors text-sm"
              />
              <button 
                onClick={fetchSuggestions}
                disabled={loading}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate
              </button>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white light:text-slate-800 uppercase tracking-wider">Top AI Recommendations</h3>
              <div className="space-y-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-[#27272A] light:border-slate-200 bg-[#0A0A0C] light:bg-slate-50 hover:border-[#00f0ff]/50 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white light:text-slate-900">{s.title}</h4>
                        <div className="text-xs text-emerald-400 mt-1">{s.estimatedImpact}</div>
                      </div>
                      <button 
                        onClick={() => onApply(s)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#00f0ff]/20"
                      >
                        <Check size={14} />
                        Apply
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="bg-[#bd00ff]/10 text-[#bd00ff] px-2 py-1 rounded font-bold">{s.trigger}</span>
                      <ArrowRight size={14} />
                      {s.actions.map((action, j) => (
                        <React.Fragment key={j}>
                          <span className="bg-white/5 light:bg-slate-200 px-2 py-1 rounded text-white light:text-slate-700">{action}</span>
                          {j < s.actions.length - 1 && <ArrowRight size={12} />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
