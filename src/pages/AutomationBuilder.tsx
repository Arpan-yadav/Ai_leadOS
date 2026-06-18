import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Mail, 
  UserPlus, 
  Clock, 
  Settings,
  ChevronRight,
  ArrowDown,
  Activity,
  Zap,
  Power,
  Bot
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const triggers = [
  { icon: UserPlus, label: 'Lead Created', desc: 'Runs when a new lead is added to CRM', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Clock, label: 'Schedule', desc: 'Runs at a specific time or interval', color: 'bg-blue-100 text-blue-600' },
  { icon: MessageSquare, label: 'Message Received', desc: 'Runs when a WhatsApp/Email arrives', color: 'bg-brand-100 text-brand-600' },
];

export default function AutomationBuilder() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automation Workflows</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Build logic that works while you sleep.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">Import template</button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Create Workflow</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Components */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Triggers</h3>
             <div className="space-y-3">
               {triggers.map((trigger, i) => (
                 <div key={i} className="group p-3 border border-slate-100 rounded-xl hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", trigger.color)}>
                        <trigger.icon size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-900 group-hover:text-brand-600">{trigger.label}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="glass-card p-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Actions</h3>
             <div className="space-y-3">
                {[
                  { icon: Mail, label: 'Send Email' },
                  { icon: MessageSquare, label: 'WhatsApp Message' },
                  { icon: Activity, label: 'Update CRM' },
                  { icon: Zap, label: 'AI Score' },
                ].map((action, i) => (
                  <div key={i} className="group p-3 border border-slate-100 rounded-xl hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-grab">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:text-brand-600 group-hover:bg-brand-100">
                        <action.icon size={18} />
                      </div>
                      <span className="font-bold text-sm text-slate-700 group-hover:text-brand-600">{action.label}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Visual Builder Canvas */}
        <div className="lg:col-span-3">
          <div className="glass-card relative min-h-[600px] bg-slate-50/30 border-dashed border-2 border-slate-200 flex flex-col items-center pt-12 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            {/* Workflow Title Block */}
            <div className="absolute top-4 left-4 bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-4 z-10">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Workflow</span>
               </div>
               <div className="h-4 w-[1px] bg-slate-200" />
               <h4 className="font-bold text-slate-900 tracking-tight underline decoration-brand-200 decoration-4 underline-offset-2 uppercase">Initial Outreach Flow</h4>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
               <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm"><Settings size={18} /></button>
               <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-xl">
                 <Power size={14} className="text-emerald-400" />
                 Active
               </button>
            </div>

            {/* Visual Steps */}
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="flex flex-col items-center space-y-8 z-10"
            >
              {/* Trigger Node */}
              <div className="w-64 bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-xl shadow-emerald-500/10 relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">Trigger</div>
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><UserPlus size={24} /></div>
                   <div>
                     <p className="font-bold text-slate-900 tracking-tight">Lead Created</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">CRM Inbound</p>
                   </div>
                 </div>
              </div>

              <ArrowDown className="text-slate-300" size={32} />

              {/* Logic Node */}
              <div className="w-72 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl relative border border-slate-800">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">AI Intelligence</div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/20"><Bot size={28} /></div>
                    <div>
                        <p className="font-bold uppercase tracking-tight text-brand-100">Score & Analyze</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Gemini 1.5 Flash</p>
                    </div>
                  </div>
              </div>

              <div className="flex items-center gap-32 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[1px] bg-slate-200 -z-10" />
                
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded tracking-widest border border-emerald-100">Score &gt; 80</div>
                   <ArrowDown className="text-slate-300" size={24} />
                   {/* Action Node */}
                    <div className="w-56 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg group hover:border-brand-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors"><Mail size={20} /></div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight uppercase">Premium Intro</p>
                      </div>
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded tracking-widest border border-slate-200">Score &lt; 80</div>
                   <ArrowDown className="text-slate-300" size={24} />
                   {/* Action Node */}
                    <div className="w-56 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><Mail size={20} /></div>
                        <p className="font-bold text-slate-900 text-sm tracking-tight uppercase">Standard Intro</p>
                      </div>
                    </div>
                </div>
              </div>

              <button className="mt-8 p-3 rounded-full bg-slate-900 text-white shadow-xl hover:scale-110 transition-transform active:scale-95">
                <Plus size={24} />
              </button>
            </motion.div>

            {/* Bottom Sheet Hint */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-6 py-2 shadow-2xl text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
               <Zap size={14} className="text-amber-500" />
               Drag chips to build your logic
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
