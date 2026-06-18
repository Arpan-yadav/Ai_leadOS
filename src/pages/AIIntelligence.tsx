import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  Target, 
  AlertCircle,
  ArrowRight,
  Zap,
  Shield,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysisResult {
  analysis: string;
  score: number;
  opportunities: string[];
  risks: string[];
}

export default function AIIntelligence() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600">
          <Sparkles size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini Pro</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">AI Intelligence Center</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Paste a company website URL to generate deep insights, audit their digital presence, and detect sales opportunities.
        </p>
      </header>

      {/* Analysis Input */}
      <div className="glass-card p-2 md:p-3 shadow-2xl shadow-brand-500/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <form onSubmit={handleAnalyze} className="relative flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 group">
            <Globe className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
              isAnalyzing ? "text-brand-500 animate-pulse" : "text-slate-400 group-hover:text-slate-600"
            )} size={22} />
            <input 
              type="text" 
              placeholder="Enter company website (e.g. stripe.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-lg font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={isAnalyzing || !url}
            className="w-full md:w-auto btn-primary py-4 px-8 text-lg rounded-xl flex items-center justify-center gap-2 disabled:bg-slate-300 shadow-xl shadow-brand-500/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Bot size={24} />
                <span>Generate Insights</span>
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
               <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
               <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin" />
               <Bot size={32} className="absolute inset-0 m-auto text-brand-600 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI is auditing digital presence</h3>
              <p className="text-slate-500 animate-pulse mt-2">Checking company profile, service offerings, and growth signals...</p>
            </div>
          </motion.div>
        ) : result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12"
          >
            {/* Lead Score Mini Card */}
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center bg-brand-900 text-white">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-200 mb-6 underline decoration-brand-500 underline-offset-8">AI Lead Intent Score</h4>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-brand-800" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="58" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={364} 
                    strokeDashoffset={364 - (364 * result.score) / 100}
                    className="text-brand-400 transition-all duration-1000" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{result.score}</span>
                  <span className="text-[10px] uppercase font-bold text-brand-300">Percent</span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 bg-brand-800 px-4 py-2 rounded-full border border-brand-700">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Growth Priority</span>
              </div>
            </div>

            {/* Analysis Content */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="text-brand-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Executive Summary</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium italic border-l-4 border-brand-100 pl-6 py-2">
                  "{result.analysis}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-emerald-100 bg-emerald-50/20">
                  <div className="flex items-center gap-2 mb-4 text-emerald-700">
                    <Zap size={20} />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Upsell Opportunities</h4>
                  </div>
                  <ul className="space-y-3">
                    {result.opportunities.map((opt, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="font-medium tracking-tight">{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6 border-rose-100 bg-rose-50/20">
                  <div className="flex items-center gap-2 mb-4 text-rose-700">
                    <Shield size={20} />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Risk Assessment</h4>
                  </div>
                  <ul className="space-y-3">
                    {result.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="font-medium tracking-tight">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="glass-card p-6 bg-slate-900 text-white flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Generate Outreach Plan</h4>
                    <p className="text-slate-400 text-sm">Create a personalized 7-day email & WhatsApp sequence.</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" size={24} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Search size={48} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">No active analysis</h3>
              <p className="text-slate-500 mt-2">Enter a URL above to unlock AI-powered company intelligence.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
               {['stripe.com', 'notion.so', 'airbnb.com'].map(site => (
                 <button 
                  key={site}
                  onClick={() => setUrl(site)}
                  className="px-4 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                 >
                   {site}
                 </button>
               ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
