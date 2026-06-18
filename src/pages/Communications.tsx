import React from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Search, 
  Filter,
  CheckCheck,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { mockLeads } from '../mockData';
import { cn } from '../lib/utils';

export default function Communications() {
  const [selectedLead, setSelectedLead] = React.useState(mockLeads[0]);

  return (
    <div className="h-[calc(100vh-140px)] flex glass-card overflow-hidden">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 tracking-tight">Messages</h3>
            <button className="text-brand-600 hover:bg-brand-50 p-1 rounded transition-colors"><MessageSquare size={20} /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-white border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockLeads.map((lead) => (
             <button 
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-white transition-colors border-b border-slate-100 last:border-0 text-left",
                selectedLead.id === lead.id && "bg-white shadow-[inset_4px_0_0_0_#4f46e5]"
              )}
             >
               <div className="relative shrink-0">
                 <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} 
                  className="w-12 h-12 rounded-full border border-slate-200"
                  alt=""
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between mb-0.5">
                   <p className="font-bold text-slate-900 text-sm tracking-tight truncate uppercase">{lead.name}</p>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">12:45 PM</span>
                 </div>
                 <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-tight">{lead.company}</p>
                 <p className="text-xs text-slate-400 truncate mt-1 tracking-tight">"Thanks for the proposal, looking forward to..."</p>
               </div>
             </button>
          ))}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="h-20 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50/20">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-white border border-slate-200 p-1">
               <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedLead.name}`} 
                className="w-full h-full rounded-full"
                alt=""
              />
             </div>
             <div>
                <h4 className="font-bold text-slate-900 text-lg tracking-tight uppercase">{selectedLead.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active now</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 mr-2">
                <button className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Phone size={18} /></button>
                <button className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Video size={18} /></button>
                <button className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Info size={18} /></button>
             </div>
             <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
               <Mail size={16} />
               <span>Switch to Email</span>
             </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
            <div className="flex flex-col items-center py-4">
              <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today, July 18</span>
            </div>

            {/* Incoming */}
            <div className="flex items-start gap-4 max-w-2xl">
               <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
               <div className="space-y-1">
                 <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-800 text-sm font-medium leading-relaxed shadow-sm">
                   Hello Sarah! Thanks for the deep dive on our site. The AI insights were surprisingly accurate. Could we jump on a quick call to discuss the automation modules?
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">12:30 PM • WhatsApp</span>
               </div>
            </div>

            {/* Outgoing */}
            <div className="flex items-start gap-4 justify-end">
               <div className="space-y-1 flex flex-col items-end">
                 <div className="bg-brand-600 text-white p-4 rounded-2xl rounded-tr-none text-sm font-medium leading-relaxed shadow-lg shadow-brand-500/20 max-w-2xl">
                   Absolutely James! Glad they helped. I have some availability tomorrow at 10 AM or 2 PM UTC. Which works better for you?
                 </div>
                 <div className="flex items-center gap-1.5 pt-1 pr-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12:45 PM • Read</span>
                    <CheckCheck size={12} className="text-brand-500" />
                 </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-brand-200 shrink-0 border border-brand-300" />
            </div>
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <button className="px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-widest border border-brand-100 border-dashed hover:bg-brand-100 transition-colors">Use AI Draft</button>
              <button className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">Value Proposition Template</button>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Paperclip size={20} /></button>
              <div className="flex-1 relative">
                 <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Smile size={18} /></button>
              </div>
              <button className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
