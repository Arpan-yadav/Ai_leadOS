'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Bot, User, Zap, Mail, MessageSquare, Check, X } from 'lucide-react'

const dummyNotifications = [
  { id: 1, type: 'AI_INSIGHT', title: 'High Intent Detected', desc: 'TechCorp showed strong buying signals.', time: '5m ago', unread: true, icon: <Bot size={14} className="text-[#00f0ff]" />, bg: 'bg-[#00f0ff]/10' },
  { id: 2, type: 'LEAD', title: 'New Lead Enrolled', desc: 'Sarah Jenkins was added to Q4 Outreach.', time: '1h ago', unread: true, icon: <User size={14} className="text-[#bd00ff]" />, bg: 'bg-[#bd00ff]/10' },
  { id: 3, type: 'MESSAGE', title: 'Email Opened', desc: 'David Park opened your proposal email.', time: '2h ago', unread: false, icon: <Mail size={14} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
  { id: 4, type: 'SYSTEM', title: 'Workflow Executed', desc: 'Daily nurture campaign completed successfully.', time: '1d ago', unread: false, icon: <Zap size={14} className="text-amber-500" />, bg: 'bg-amber-500/10' },
]

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL')
  const [notifications, setNotifications] = useState(dummyNotifications)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Small delay so the button click that opens doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const displayed = notifications.filter(n => activeTab === 'ALL' || n.unread)
  const unreadCount = notifications.filter(n => n.unread).length

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  const markRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  return (
    <div ref={panelRef} className="absolute top-[60px] right-0 w-80 glass-panel shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#27272A] light:border-slate-300 rounded-2xl overflow-hidden z-50 flex flex-col max-h-[80vh] animate-fade-in origin-top-right">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 light:border-slate-200 bg-black/40 light:bg-slate-100 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-white light:text-slate-800 text-sm tracking-tight">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-widest text-[#00f0ff] hover:text-[#00a3ff] transition-colors flex items-center gap-1">
            <Check size={10} /> Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 light:border-slate-200 shrink-0">
        <button 
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-center transition-colors border-b-2 ${activeTab === 'ALL' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-slate-500 hover:text-white light:hover:text-slate-700'}`}
        >
          All
        </button>
        <button 
          onClick={() => setActiveTab('UNREAD')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-center transition-colors border-b-2 ${activeTab === 'UNREAD' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-slate-500 hover:text-white light:hover:text-slate-700'}`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-black/20 light:bg-white/50">
        {displayed.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 light:bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Check size={20} className="text-slate-600 light:text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-300 light:text-slate-600">All caught up!</p>
            <p className="text-[10px] text-slate-500 mt-1">No new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 light:divide-slate-100">
            {displayed.map(n => (
              <div 
                key={n.id} 
                onClick={() => markRead(n.id)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 light:hover:bg-slate-50 transition-colors ${n.unread ? 'bg-[#00f0ff]/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center mt-0.5 ${n.bg}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-xs font-bold truncate ${n.unread ? 'text-white light:text-slate-900' : 'text-slate-400 light:text-slate-600'}`}>
                      {n.title}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap ml-2">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5 leading-snug line-clamp-2">
                    {n.desc}
                  </p>
                </div>
                {n.unread && (
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] shrink-0 self-center shadow-[0_0_8px_#00f0ff]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
