'use client';
import React from 'react';
import { MessageSquare, Mail, Phone, Linkedin, Facebook, Send, Clock, CheckCheck } from 'lucide-react';

const recentMessages = [
  { name: 'James Wilson', company: 'TechCorp', channel: 'WhatsApp', message: 'Sounds great! When can we schedule a call?', time: '2m ago', read: true },
  { name: 'Elena Rodriguez', company: 'BrightMedia', channel: 'Email', message: 'I reviewed the proposal. A few questions...', time: '15m ago', read: false },
  { name: 'Rahul Sharma', company: 'Digital Agency', channel: 'LinkedIn', message: 'Thank you for connecting! Excited to chat.', time: '1h ago', read: true },
  { name: 'Sarah Jenkins', company: 'Innovate Co', channel: 'Meta', message: 'Clicked on your ad. Looking for CRM solutions.', time: '2h ago', read: false },
  { name: 'Michael Torres', company: 'Globus Logistics', channel: 'Email', message: 'Following up on the quote we discussed...', time: '3h ago', read: true },
];

const channelIcon = (channel: string) => {
  switch(channel) {
    case 'WhatsApp': return <MessageSquare size={14} className="text-emerald-400" />;
    case 'Email':    return <Mail size={14} className="text-[#00f0ff]" />;
    case 'LinkedIn': return <Linkedin size={14} className="text-blue-400" />;
    case 'Meta':     return <Facebook size={14} className="text-[#bd00ff]" />;
    default:         return <Phone size={14} className="text-slate-400" />;
  }
};

export default function CommunicationsPage() {
  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Communications</h1>
          <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">Unified inbox — WhatsApp · Email · LinkedIn · Meta</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Send size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">New Message</span>
        </button>
      </header>

      {/* Channel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'WhatsApp', count: 24, color: 'text-emerald-400', icon: MessageSquare },
          { label: 'Email', count: 18, color: 'text-[#00f0ff]', icon: Mail },
          { label: 'LinkedIn', count: 7, color: 'text-blue-400', icon: Linkedin },
          { label: 'Meta Ads', count: 12, color: 'text-[#bd00ff]', icon: Facebook },
        ].map(ch => (
          <div key={ch.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ch.icon size={16} className={ch.color} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${ch.color}`}>{ch.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{ch.count}</p>
            <p className="text-[10px] text-[#b9cacb] mt-1">active threads</p>
          </div>
        ))}
      </div>

      {/* Message List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Recent Conversations</h3>
          <span className="text-[10px] bg-[#ff007a]/10 text-[#ff007a] border border-[#ff007a]/20 px-2 py-0.5 rounded-full font-bold uppercase">
            3 Unread
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {recentMessages.map((msg, i) => (
            <div key={i} className={`px-6 py-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors ${!msg.read ? 'bg-[#00f0ff]/5' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#00f0ff]/20 flex items-center justify-center text-[11px] font-bold text-[#00f0ff] shrink-0">
                {msg.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white">{msg.name}</span>
                  <span className="text-[10px] text-[#b9cacb]">·</span>
                  <span className="text-[10px] text-[#b9cacb]">{msg.company}</span>
                  {!msg.read && <div className="w-1.5 h-1.5 rounded-full bg-[#ff007a] shadow-[0_0_6px_rgba(255,0,122,0.8)]" />}
                </div>
                <p className="text-[12px] text-[#b9cacb] truncate">{msg.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  {channelIcon(msg.channel)}
                  <span className="text-[9px] text-[#b9cacb] uppercase">{msg.channel}</span>
                </div>
                <span className="text-[9px] text-[#b9cacb] flex items-center gap-1">
                  <Clock size={8} />
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
