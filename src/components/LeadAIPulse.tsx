import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Mail, 
  MessageSquare, 
  Target,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Facebook,
  CheckCircle2
} from 'lucide-react';
import { AIInsight, Lead } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LeadAIPulseProps {
  lead: Lead;
  insight: AIInsight;
  onExecuteAutomation: () => void;
}

const SourceIcon = ({ source }: { source: Lead['source'] }) => {
  switch (source) {
    case 'WhatsApp': return <MessageSquare size={14} className="text-emerald-500" />;
    case 'Email': return <Mail size={14} className="text-blue-500" />;
    case 'Meta Leads': return <Facebook size={14} className="text-brand-600" />;
    case 'LinkedIn': return <Smartphone size={14} className="text-indigo-600" />;
    default: return <Target size={14} className="text-slate-400" />;
  }
};

export default function LeadAIPulse({ lead, insight, onExecuteAutomation }: LeadAIPulseProps) {
  return (
    <div className="space-y-4">
      {/* High Density Score Header */}
      <div className="p-4 bg-brand-900 text-white rounded-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 opacity-20 blur-[60px]" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot size={14} className="text-brand-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-300">Quality Assessment</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tighter">{insight.qualityScore}</span>
              <span className="text-xs font-bold text-brand-300">/100</span>
            </div>
            <p className="text-[10px] text-brand-100/60 font-medium leading-tight max-w-[180px]">
              {insight.qualityReason}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-brand-800 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t-4 border-brand-400 animate-spin" />
            <Sparkles size={24} className="text-brand-400" />
          </div>
        </div>
      </div>

      {/* Source & Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Source</p>
          <div className="flex items-center gap-2">
            <SourceIcon source={lead.source} />
            <span className="text-xs font-bold text-slate-700">{lead.source}</span>
          </div>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-lg">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sentiment</p>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              insight.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-slate-400'
            )} />
            <span className="text-xs font-bold text-slate-700 uppercase">{insight.sentiment}</span>
          </div>
        </div>
      </div>

      {/* Strategic Follow-up Plan */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-indigo-600" />
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Follow-up Strategy</h4>
        </div>
        <div className="space-y-3">
          {insight.suggestedFollowUp.plan.map((step, i) => (
            <div key={i} className="flex gap-3 items-start group">
              <div className="w-5 h-5 rounded bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                {i + 1}
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed pt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Trigger */}
      <button 
        onClick={onExecuteAutomation}
        className="w-full btn-primary bg-indigo-600 hover:bg-brand-700 p-3 flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">Execute AI Automation</span>
        </div>
        <span className="text-[9px] font-medium text-white/70 uppercase tracking-tight">
          Next: {insight.suggestedFollowUp.nextAction}
        </span>
      </button>

      <div className="flex items-center justify-center gap-2 py-1">
        <ShieldCheck size={12} className="text-slate-300" />
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Security Verified by Enterprise OS</span>
      </div>
    </div>
  );
}
