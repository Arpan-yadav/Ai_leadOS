'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Workflow, Trash2, Users, Calendar, Play, Mail, Linkedin, MessageSquare, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import AddSequenceModal from '@/components/sequences/AddSequenceModal'
import EnrollLeadsModal from '@/components/sequences/EnrollLeadsModal'

export default function SequencesPage() {
  const [sequences, setSequences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isAddSequenceModalOpen, setIsAddSequenceModalOpen] = useState(false)
  const [enrollingSequence, setEnrollingSequence] = useState<{id: string, name: string} | null>(null)
  const { resolvedTheme } = useTheme()
  const token = getToken()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { fetchSequences() }, [])

  const isDark = !mounted || resolvedTheme === 'dark'

  const fetchSequences = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sequences', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.data ?? data.sequences ?? [])
        setSequences(list)
      }
    } catch (err) {
      console.error('Failed to fetch sequences', err)
    } finally {
      setLoading(false)
    }
  }

  const openEnrollModal = (seq: any) => {
    setEnrollingSequence({ id: seq.id, name: seq.name })
  }

  const deleteSequence = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/sequences/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSequences()
    } catch (err) {
      console.error('Failed to delete', err)
    }
  }

  /* ── Per-channel badge styles ── */
  const channelBadge = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email':
        return {
          wrap: isDark
            ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff]'
            : 'bg-blue-50 border border-blue-200 text-blue-600',
          icon: <Mail size={10} />
        }
      case 'linkedin':
        return {
          wrap: isDark
            ? 'bg-[#bd00ff]/10 border border-[#bd00ff]/20 text-[#bd00ff]'
            : 'bg-purple-50 border border-purple-200 text-purple-600',
          icon: <Linkedin size={10} />
        }
      case 'whatsapp':
        return {
          wrap: isDark
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-600',
          icon: <MessageSquare size={10} />
        }
      default:
        return {
          wrap: isDark
            ? 'bg-white/10 border border-white/10 text-[#b9cacb]'
            : 'bg-slate-100 border border-slate-200 text-slate-500',
          icon: null
        }
    }
  }

  /* ── Derived theme tokens used throughout ── */
  const t = {
    heading:      isDark ? 'text-white'      : 'text-slate-900',
    subtext:      isDark ? 'text-[#b9cacb]'  : 'text-slate-500',
    label:        isDark ? 'text-[#b9cacb]'  : 'text-slate-400',
    value:        isDark ? 'text-white'       : 'text-slate-800',
    divider:      isDark ? 'border-white/5'   : 'border-slate-100',
    stepRow:      isDark
      ? 'bg-white/5 border border-white/8 hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5'
      : 'bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40',
    stepTitle:    isDark ? 'text-white group-hover:text-[#00f0ff]' : 'text-slate-700 group-hover:text-blue-700',
    dayBubble:    isDark
      ? 'bg-[#111114] border border-[#00f0ff]/30 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.15)]'
      : 'bg-white border-2 border-blue-300 text-blue-600 shadow-sm',
    connector:    isDark ? 'before:bg-white/10' : 'before:bg-slate-200',
    cardFooter:   isDark
      ? 'bg-white/3 border-white/5 text-[#b9cacb]'
      : 'bg-slate-50 border-slate-100 text-slate-500',
    enrollBtn:    isDark
      ? 'bg-[#00f0ff]/10 border-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/20 hover:shadow-[0_0_12px_rgba(0,240,255,0.2)]'
      : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
    deleteBtn:    isDark
      ? 'text-[#b9cacb] hover:text-[#ff007a] hover:bg-[#ff007a]/10'
      : 'text-slate-300 hover:text-red-500 hover:bg-red-50',
    emptyIcon:    isDark ? 'bg-[#bd00ff]/10 border-[#bd00ff]/20' : 'bg-purple-50 border-purple-200',
    emptyIconClr: isDark ? 'text-[#bd00ff]' : 'text-purple-500',
    emptyTitle:   isDark ? 'text-white' : 'text-slate-700',
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Header ── */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight uppercase flex items-center gap-3 ${t.heading}`}>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#bd00ff]/10 border-[#bd00ff]/20 shadow-[0_0_12px_rgba(189,0,255,0.15)]' : 'bg-purple-50 border-purple-200'}`}>
              <Workflow size={22} className={t.emptyIconClr} />
            </div>
            Outreach Sequences
          </h1>
          <p className={`mt-2 font-mono text-[11px] uppercase tracking-wider ${t.subtext}`}>
            Build and manage multi-channel automated campaigns.
          </p>
        </div>
        <button onClick={() => setIsAddSequenceModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Create Sequence</span>
        </button>
      </header>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-[#00f0ff]' : 'text-blue-500'}`} />
          <p className={`font-mono text-sm ${t.subtext}`}>Loading sequences...</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && sequences.length === 0 && (
        <div className="glass-panel py-20 flex flex-col items-center justify-center text-center">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${t.emptyIcon}`}>
            <Workflow size={32} className={t.emptyIconClr} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${t.emptyTitle}`}>No sequences yet</h3>
          <p className={`text-sm max-w-md leading-relaxed ${t.subtext}`}>
            Create your first automated sequence to start enrolling leads into targeted email, LinkedIn, and WhatsApp cadences.
          </p>
          <button onClick={() => setIsAddSequenceModalOpen(true)} className="btn-primary mt-6 flex items-center gap-2">
            <Plus size={14} />
            Create your first sequence
          </button>
        </div>
      )}

      {/* ── Cards Grid ── */}
      {!loading && sequences.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sequences.map(seq => (
            <div key={seq.id} className="glass-card flex flex-col hover:-translate-y-1 transition-transform duration-300 overflow-hidden">
              {/* Card Body */}
              <div className="p-6 flex-1">
                {/* Title row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className={`text-base font-bold tracking-tight truncate ${t.heading}`}>{seq.name}</h3>
                    <p className={`text-[12px] mt-1 line-clamp-2 leading-relaxed ${t.subtext}`}>{seq.description}</p>
                  </div>
                  <button onClick={() => deleteSequence(seq.id)} className={`transition-all p-1.5 rounded-lg shrink-0 ${t.deleteBtn}`}>
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Stats row */}
                <div className={`flex gap-4 mb-5 py-3 border-y ${t.divider}`}>
                  <div className="flex-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${t.label}`}>
                      <Calendar size={10} /> Duration
                    </div>
                    <div className={`text-sm font-bold ${t.value}`}>{seq.durationDays} Days</div>
                  </div>
                  <div className={`flex-1 border-l pl-4 ${t.divider}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${t.label}`}>
                      <Users size={10} /> Enrolled
                    </div>
                    <div className={`text-sm font-bold ${t.value}`}>{seq._count?.enrollments || 0} Leads</div>
                  </div>
                  <div className={`flex-1 border-l pl-4 ${t.divider}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.label}`}>Status</div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      isDark
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {seq.status}
                    </span>
                  </div>
                </div>

                {/* Cadence Steps */}
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${t.label}`}>Cadence Steps</h4>
                  <div className={`space-y-2 relative before:absolute before:inset-y-2 before:left-[11px] before:w-0.5 ${t.connector}`}>
                    {seq.steps?.map((step: any, idx: number) => {
                      const badge = channelBadge(step.channel)
                      return (
                        <div key={idx} className="flex items-center gap-3 relative z-10">
                          {/* Day bubble */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${t.dayBubble}`}>
                            D{step.day}
                          </div>
                          {/* Step row */}
                          <div className={`flex-1 rounded-xl p-2.5 flex items-center justify-between cursor-pointer group transition-all ${t.stepRow}`}>
                            <span className={`text-[12px] font-semibold transition-colors ${t.stepTitle}`}>
                              {step.title}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badge.wrap}`}>
                              {badge.icon}
                              {step.channel}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className={`px-6 py-3 border-t flex justify-between items-center ${t.cardFooter}`}>
                <span className="text-[11px]">
                  Last updated {new Date(seq.updatedAt).toLocaleDateString()}
                </span>
                <button onClick={() => openEnrollModal(seq)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${t.enrollBtn}`}>
                  <Play size={11} />
                  Enroll Leads
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddSequenceModalOpen && (
        <AddSequenceModal 
          onClose={() => setIsAddSequenceModalOpen(false)}
          onAdd={() => {
            setIsAddSequenceModalOpen(false)
            fetchSequences()
          }}
        />
      )}

      {enrollingSequence && (
        <EnrollLeadsModal
          sequenceName={enrollingSequence.name}
          onClose={() => {
            setEnrollingSequence(null)
            fetchSequences()
          }}
        />
      )}
    </div>
  )
}
