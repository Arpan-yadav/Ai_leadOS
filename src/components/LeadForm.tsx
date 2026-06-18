import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  DollarSign,
  Briefcase,
  Bot,
  Sparkles
} from 'lucide-react';

interface LeadFormProps {
  onSubmit: (lead: any) => void;
  onCancel: () => void;
}

export default function LeadForm({ onSubmit, onCancel }: LeadFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSubmit({ success: true });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Company Name</label>
            <div className="relative group">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="Acme Corp"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Website URL</label>
            <div className="relative group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="acme.com"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Contact</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
              <input 
                required
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="john@acme.com"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Pipeline Stage</label>
            <div className="relative group">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all appearance-none">
                <option>Discovery</option>
                <option>Qualified</option>
                <option>Negotation</option>
                <option>Closed Won</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-brand-600" />
          <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest">AI Intelligence Check</span>
        </div>
        <p className="text-[10px] text-brand-600 font-medium leading-relaxed italic">
          Copilot will automatically enrich this lead with LinkedIn data and intent scoring after submission.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex-[2] btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles size={14} />
              <span>Create Lead</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
