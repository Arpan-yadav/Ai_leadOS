'use client';
import React from 'react';
import { 
  UserPlus, ArrowRightLeft, MailOpen, MousePointerClick, 
  FileText, Tag, Hand, Webhook, Mail, MessageSquare, 
  Linkedin, ListPlus, ListMinus, ArrowUpCircle, 
  Tag as TagIcon, XSquare, UserCheck, CheckSquare, 
  Clock, Send, Zap, Sparkles 
} from 'lucide-react';

const triggers = [
  { type: 'triggerNode', label: 'New Lead Created', icon: UserPlus, desc: 'When a new lead enters CRM' },
  { type: 'triggerNode', label: 'Stage Changed', icon: ArrowRightLeft, desc: 'When pipeline stage updates' },
  { type: 'triggerNode', label: 'Email Opened', icon: MailOpen, desc: 'When a lead opens an email' },
  { type: 'triggerNode', label: 'Link Clicked', icon: MousePointerClick, desc: 'When a lead clicks a link' },
  { type: 'triggerNode', label: 'Form Submitted', icon: FileText, desc: 'When a web form is submitted' },
  { type: 'triggerNode', label: 'Tag Added', icon: Tag, desc: 'When a specific tag is applied' },
  { type: 'triggerNode', label: 'Manual Trigger', icon: Hand, desc: 'Triggered manually by user' },
  { type: 'triggerNode', label: 'Custom Webhook', icon: Webhook, desc: 'Incoming HTTP POST request' },
];

const actions = [
  { type: 'actionNode', label: 'Send Email', icon: Mail, desc: 'Send an automated email' },
  { type: 'actionNode', label: 'Send WhatsApp', icon: MessageSquare, desc: 'Send WhatsApp message' },
  { type: 'actionNode', label: 'Send LinkedIn DM', icon: Linkedin, desc: 'Send LinkedIn message' },
  { type: 'actionNode', label: 'Add to Sequence', icon: ListPlus, desc: 'Enroll lead in sequence' },
  { type: 'actionNode', label: 'Remove from Seq', icon: ListMinus, desc: 'Unenroll from sequence' },
  { type: 'actionNode', label: 'Update Stage', icon: ArrowUpCircle, desc: 'Change pipeline stage' },
  { type: 'actionNode', label: 'Add Tag', icon: TagIcon, desc: 'Add a tag to lead' },
  { type: 'actionNode', label: 'Remove Tag', icon: XSquare, desc: 'Remove tag from lead' },
  { type: 'actionNode', label: 'Assign Owner', icon: UserCheck, desc: 'Assign to sales rep' },
  { type: 'actionNode', label: 'Create Task', icon: CheckSquare, desc: 'Create a CRM task' },
  { type: 'actionNode', label: 'Add Delay', icon: Clock, desc: 'Wait for X days/hours' },
  { type: 'actionNode', label: 'Trigger Webhook', icon: Send, desc: 'Send outgoing webhook' },
];

const aiNodes = [
  { type: 'aiDecisionNode', label: 'AI Score Decision', icon: Sparkles, desc: 'Branch based on AI intent score' }
];

export default function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, desc: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.setData('application/desc', desc);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 h-full bg-[#0A0A0C] light:bg-slate-50 border-r border-[#27272A] light:border-slate-200 flex flex-col overflow-y-auto shrink-0">
      <div className="p-4 border-b border-[#27272A] light:border-slate-200 sticky top-0 bg-[#0A0A0C]/90 light:bg-slate-50/90 backdrop-blur-md z-10">
        <h3 className="text-xs font-black text-white light:text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-[#00f0ff]" />
          Node Library
        </h3>
      </div>
      
      <div className="p-4 space-y-6 pb-20">
        {/* Triggers */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-emerald-400 light:text-emerald-600 uppercase tracking-widest">Triggers (8)</h4>
          <div className="grid grid-cols-1 gap-2">
            {triggers.map((item, i) => (
              <div 
                key={i}
                onDragStart={(e) => onDragStart(e, item.type, item.label, item.desc)}
                draggable
                className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-white cursor-grab active:cursor-grabbing hover:border-emerald-500/50 light:hover:border-emerald-400 transition-colors"
              >
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 light:text-emerald-600">
                  <item.icon size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white light:text-slate-800">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Intelligence */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#bd00ff] light:text-purple-600 uppercase tracking-widest">AI Intelligence</h4>
          <div className="grid grid-cols-1 gap-2">
            {aiNodes.map((item, i) => (
              <div 
                key={i}
                onDragStart={(e) => onDragStart(e, item.type, item.label, item.desc)}
                draggable
                className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-white cursor-grab active:cursor-grabbing hover:border-[#bd00ff]/50 light:hover:border-purple-400 transition-colors shadow-[0_0_10px_rgba(189,0,255,0.05)]"
              >
                <div className="p-1.5 rounded bg-[#bd00ff]/10 text-[#bd00ff] light:text-purple-600">
                  <item.icon size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white light:text-slate-800">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#00f0ff] light:text-indigo-600 uppercase tracking-widest">Actions (12)</h4>
          <div className="grid grid-cols-1 gap-2">
            {actions.map((item, i) => (
              <div 
                key={i}
                onDragStart={(e) => onDragStart(e, item.type, item.label, item.desc)}
                draggable
                className="flex items-center gap-3 p-3 rounded-lg border border-[#27272A] light:border-slate-200 bg-[#111114] light:bg-white cursor-grab active:cursor-grabbing hover:border-[#00f0ff]/50 light:hover:border-indigo-400 transition-colors"
              >
                <div className="p-1.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] light:text-indigo-600">
                  <item.icon size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white light:text-slate-800">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
