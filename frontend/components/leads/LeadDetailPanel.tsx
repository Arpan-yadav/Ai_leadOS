'use client'
import React, { useState } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import ScoreBadge from '../ui/ScoreBadge'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const LeadDetailPanel = ({ lead, onClose, onUpdate }: {
  lead: any
  onClose: () => void
  onUpdate?: () => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: lead.name,
    title: lead.title || '',
    company: lead.company,
    email: lead.email,
    phone: lead.phone || '',
    source: lead.source
  })

  const handleSave = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to update lead')
      toast.success('Lead updated successfully')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-100 bg-white dark:bg-[#0A0A0C] border-l border-slate-200 dark:border-[#27272A] shadow-2xl dark:shadow-none z-50 p-6 overflow-y-auto transform transition-transform duration-300">
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Lead Intelligence
        </h2>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-500 hover:text-[#00f0ff] dark:text-[#b9cacb] dark:hover:text-[#00f0ff] rounded-xl transition-colors"
              title="Edit Lead"
            >
              <Edit2 size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors"
              title="Save Changes"
            >
              <Save size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#b9cacb] dark:hover:text-white dark:hover:bg-[#27272A] rounded-xl transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-8 p-6 glass-card bg-slate-50 dark:bg-transparent text-center relative overflow-hidden group border border-slate-200 dark:border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-[#00f0ff]/20 transition-colors" />
        <div className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-[#16161D] border-2 border-[#00f0ff]/50 flex items-center justify-center text-2xl font-display font-black text-[#00f0ff] mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {lead.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
        </div>
        
        {isEditing ? (
          <div className="space-y-2 relative z-10">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-center font-bold text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Title"
              className="w-full bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-center text-sm font-mono uppercase tracking-widest text-slate-500 dark:text-[#b9cacb]"
            />
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">{lead.name}</h3>
            <p className="text-slate-500 dark:text-[#b9cacb] text-sm mt-1 font-mono uppercase tracking-widest">{lead.title || "No title"}</p>
          </>
        )}
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-5 space-y-4 bg-white dark:bg-transparent border border-slate-200 dark:border-white/5">
          <h4 className="text-[10px] font-mono font-bold text-[#00f0ff] uppercase tracking-widest border-b border-slate-100 dark:border-[#27272A] pb-2 mb-3">Core Data</h4>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-1">Company</span>
            {isEditing ? (
              <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="bg-slate-100 dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-sm text-slate-900 dark:text-white" />
            ) : (
              <span className="text-sm text-slate-900 dark:text-white font-bold">{lead.company}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-1">Email</span>
            {isEditing ? (
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-slate-100 dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-sm text-slate-900 dark:text-white" />
            ) : (
              <span className="text-sm text-slate-900 dark:text-white font-bold">{lead.email}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-1">Phone</span>
            {isEditing ? (
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-slate-100 dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-sm text-slate-900 dark:text-white" />
            ) : (
              <span className="text-sm text-slate-900 dark:text-white font-bold">{lead.phone || "Not provided"}</span>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-1">Source</span>
            {isEditing ? (
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="bg-slate-100 dark:bg-[#111114] border border-slate-200 dark:border-[#27272A] rounded p-1 text-sm text-slate-900 dark:text-white uppercase">
                <option value="LINKEDIN">LinkedIn</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="META_LEADS">Meta Leads</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
              </select>
            ) : (
              <span className="text-sm text-slate-900 dark:text-white font-bold">{lead.source}</span>
            )}
          </div>

        </div>

        <div className="glass-panel p-5 bg-white dark:bg-transparent border border-slate-200 dark:border-white/5">
          <h4 className="text-[10px] font-mono font-bold text-[#bd00ff] uppercase tracking-widest border-b border-slate-100 dark:border-[#27272A] pb-2 mb-4">Pipeline Status</h4>
          
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-2">Current Stage</p>
              <StatusBadge status={lead.status} />
            </div>

            <div>
              <p className="text-[10px] text-slate-400 dark:text-[#5a6474] font-mono uppercase tracking-widest mb-2">AI Conversion Score</p>
              <ScoreBadge score={lead.score} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadDetailPanel