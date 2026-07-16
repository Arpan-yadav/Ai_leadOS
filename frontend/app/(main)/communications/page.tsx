'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Linkedin, Facebook, Send, Clock, X, ArrowLeft, Archive, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import NewMessageModal from '@/components/communications/NewMessageModal';
import { getToken } from '@/lib/auth';



const channelIcon = (channel: string, size = 14) => {
  switch(channel) {
    case 'WhatsApp': return <MessageSquare size={size} className="text-emerald-400" />;
    case 'Email':    return <Mail size={size} className="text-[#00f0ff]" />;
    case 'LinkedIn': return <Linkedin size={size} className="text-blue-400" />;
    case 'Meta':     return <Facebook size={size} className="text-[#bd00ff]" />;
    default:         return <Phone size={size} className="text-slate-400" />;
  }
};

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const token = getToken();

  const fetchLogs = async () => {
    try {
      if (!token) return;
      const res = await fetch('http://localhost:3001/api/communications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const grouped: Record<string, any> = {};
      data.forEach((log: any) => {
        if (!grouped[log.leadId]) {
          grouped[log.leadId] = {
            leadId: log.leadId,
            name: log.lead.name,
            email: log.lead.email,
            company: log.lead.company,
            channel: log.channel,
            time: new Date(log.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            rawTime: new Date(log.sentAt).getTime(),
            read: log.status === 'read',
            message: log.content,
            thread: []
          };
        }
        grouped[log.leadId].thread.unshift({
          from: log.direction === 'inbound' ? 'them' : 'me',
          text: log.content,
          time: new Date(log.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        if (new Date(log.sentAt).getTime() > grouped[log.leadId].rawTime) {
          grouped[log.leadId].message = log.content;
          grouped[log.leadId].time = new Date(log.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          grouped[log.leadId].rawTime = new Date(log.sentAt).getTime();
        }
      });
      const sorted = Object.values(grouped).sort((a: any, b: any) => b.rawTime - a.rawTime);
      setMessages(sorted);
    } catch (err) {
      console.error('Failed to fetch communications', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleArchive = () => {
    toast.success('Conversation archived');
    setSelected(null);
  }

  const handleEdit = (index: number, content: string) => {
    setEditingMsgIndex(index);
    setEditContent(content);
  }

  const saveEdit = () => {
    toast.success('Message updated');
    setEditingMsgIndex(null);
    setEditContent('');
  }

  const handleSendReply = async () => {
    if (!reply.trim() || !selected || isSendingReply) return;
    const replyText = reply.trim();
    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Optimistic update
    const newMsg = { from: 'me', text: replyText, time: now };
    setSelected((prev: any) => ({ ...prev, thread: [...prev.thread, newMsg], message: replyText, time: now }));
    setReply('');
    setIsSendingReply(true);

    try {
      await fetch('http://localhost:3001/api/communications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          leadId: selected.leadId,
          channel: selected.channel,
          content: replyText,
        })
      });
    } catch (err) {
      console.error('Failed to send reply', err);
      toast.error('Failed to send message');
    } finally {
      setIsSendingReply(false);
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in h-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight uppercase">Communications</h1>
          <p className="text-slate-500 dark:text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">Unified inbox — WhatsApp · Email · LinkedIn · Meta</p>
        </div>
        <button onClick={() => setIsNewMessageModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Send size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">New Message</span>
        </button>
      </header>

      {/* Channel Stats - Dynamic from real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'WhatsApp', channel: 'WHATSAPP', color: 'text-emerald-400', icon: MessageSquare },
          { label: 'Email', channel: 'EMAIL', color: 'text-[#00f0ff]', icon: Mail },
          { label: 'LinkedIn', channel: 'LINKEDIN', color: 'text-blue-400', icon: Linkedin },
          { label: 'Meta Ads', channel: 'META', color: 'text-[#bd00ff]', icon: Facebook },
        ].map(ch => (
          <div key={ch.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ch.icon size={16} className={ch.color} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${ch.color}`}>{ch.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{messages.filter((m: any) => m.channel === ch.channel).length}</p>
            <p className="text-[10px] text-slate-500 dark:text-[#b9cacb] mt-1">active threads</p>
          </div>
        ))}
      </div>

      {/* Inbox + Conversation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '420px' }}>

        {/* Message List */}
        <div className={`glass-card overflow-hidden ${selected ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Recent Conversations</h3>
            <span className="text-[10px] bg-[#ff007a]/10 text-[#ff007a] border border-[#ff007a]/20 px-2 py-0.5 rounded-full font-bold uppercase">
              {messages.filter(m => !m.read).length} Unread
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {messages.map((msg, i) => (
              <div
                key={i}
                onClick={() => setSelected(msg)}
                className={`px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors
                  ${selected?.name === msg.name
                    ? 'bg-[#00f0ff]/10 border-l-2 border-[#00f0ff]'
                    : !msg.read
                    ? 'bg-[#00f0ff]/5 hover:bg-[#00f0ff]/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#00f0ff]/20 flex items-center justify-center text-[11px] font-bold text-[#00f0ff] shrink-0">
                  {msg.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{msg.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-[#b9cacb]">·</span>
                    <span className="text-[10px] text-slate-400 dark:text-[#b9cacb]">{msg.company}</span>
                    {!msg.read && <div className="w-1.5 h-1.5 rounded-full bg-[#ff007a] shadow-[0_0_6px_rgba(255,0,122,0.8)]" />}
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-[#b9cacb] truncate">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    {channelIcon(msg.channel)}
                    {!selected && <span className="text-[9px] text-slate-400 dark:text-[#b9cacb] uppercase">{msg.channel}</span>}
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-[#b9cacb] flex items-center gap-1">
                    <Clock size={8} />
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Thread Panel */}
        {selected && (
          <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-[#b9cacb] hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors lg:hidden"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#00f0ff]/20 flex items-center justify-center text-[11px] font-bold text-[#00f0ff] shrink-0">
                {selected.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{selected.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-[#b9cacb]">{selected.company}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                {channelIcon(selected.channel, 12)}
                <span className="text-slate-400 dark:text-[#b9cacb] uppercase">{selected.channel}</span>
              </div>
              <button onClick={handleArchive} className="p-1.5 rounded-lg text-slate-400 dark:text-[#b9cacb] hover:text-amber-500 hover:bg-amber-500/10 transition-colors ml-2" title="Archive">
                <Archive size={14} />
              </button>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 dark:text-[#b9cacb] hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[250px] max-h-[350px]">
              {selected.thread.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} group`}>
                  
                  {msg.from === 'me' && editingMsgIndex !== i && (
                    <button 
                      onClick={() => handleEdit(i, msg.text)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#00f0ff] transition-all self-center mr-2"
                      title="Edit Message"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}

                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.from === 'me'
                      ? 'bg-[#00f0ff]/20 dark:bg-[#00f0ff]/15 border border-[#00f0ff]/20 text-slate-800 dark:text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-[#16161D] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-[#e5e1e4] rounded-bl-sm'
                    }`}
                  >
                    {editingMsgIndex === i ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={editContent} 
                          onChange={e => setEditContent(e.target.value)} 
                          className="w-full bg-black/20 text-white rounded p-2 text-xs border border-white/20 outline-none focus:border-[#00f0ff]" 
                          rows={2} 
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingMsgIndex(null)} className="text-[9px] uppercase font-bold text-slate-400 hover:text-white">Cancel</button>
                          <button onClick={saveEdit} className="text-[9px] uppercase font-bold text-[#00f0ff] hover:text-[#00a3ff] flex items-center gap-1"><Check size={10} /> Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{msg.text}</p>
                        <p className="text-[9px] text-slate-400 dark:text-[#5a6474] mt-1 text-right">{msg.time}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="px-5 py-4 border-t border-slate-200 dark:border-white/5 flex gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendReply(); }}
                disabled={isSendingReply}
                placeholder={`Reply via ${selected.channel}...`}
                className="flex-1 text-sm bg-slate-50 dark:bg-[#0A0A0C] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/20 transition-all placeholder:text-slate-400 dark:placeholder:text-[#5a6474] disabled:opacity-50"
              />
              <button
                onClick={handleSendReply}
                disabled={isSendingReply}
                className="p-2.5 rounded-xl bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/30 text-[#00f0ff] transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isNewMessageModalOpen && (
        <NewMessageModal 
          onClose={() => setIsNewMessageModalOpen(false)} 
          onSent={() => {
            setIsNewMessageModalOpen(false);
            fetchLogs(); // re-fetch without reload
          }}
        />
      )}
    </div>
  );
}
