'use client'
import React, { useState, useEffect } from 'react'
import { X, Loader2, CheckSquare, Square } from 'lucide-react'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string
  name: string
  company: string
}

export default function EnrollLeadsModal({ sequenceId, sequenceName, onClose }: { sequenceId: string, sequenceName: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [fetchingLeads, setFetchingLeads] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = getToken()
        const res = await fetch('http://localhost:3001/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          // API may return array directly or wrapped in {data: [...]}
          const list = Array.isArray(data) ? data : (data.data ?? data.leads ?? [])
          setLeads(list)
        }
      } catch (err) {
        console.error('Failed to fetch leads', err)
      } finally {
        setFetchingLeads(false)
      }
    }
    fetchLeads()
  }, [])

  const toggleLead = (id: string) => {
    const next = new Set(selectedLeads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedLeads(next)
  }

  const toggleAll = () => {
    if (selectedLeads.size === leads.length) setSelectedLeads(new Set())
    else setSelectedLeads(new Set(leads.map(l => l.id)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedLeads.size === 0) {
      toast.error('Please select at least one lead to enroll')
      return
    }

    try {
      setLoading(true)
      const token = getToken()
      
      // Call backend to enroll leads one by one or in bulk (assuming sequenceId exists)
      const enrollPromises = Array.from(selectedLeads).map(leadId => 
        fetch(`http://localhost:3001/api/sequences/${sequenceId}/enroll/${leadId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      )
      
      await Promise.all(enrollPromises)
      
      toast.success('Leads successfully enrolled!')
      setIsSuccess(true)
    } catch (err: any) {
      toast.error('Error enrolling leads')
    } finally {
      setLoading(false)
    }
  }

  const router = useRouter()

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="glass-panel w-full max-w-sm p-8 flex flex-col items-center justify-center animate-scale-in text-center border-[#00f0ff]/30 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
          <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 flex items-center justify-center mb-6">
            <CheckSquare size={32} className="text-[#00f0ff]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Leads Enrolled!</h2>
          <p className="text-[#b9cacb] text-sm mb-8">
            Successfully enrolled {selectedLeads.size} leads into the <span className="text-white font-medium">{sequenceName}</span> sequence. They will begin receiving automated outreach based on your workflow.
          </p>
          <div className="flex flex-col w-full gap-3">
            <button onClick={() => { onClose(); router.push('/sequences?tab=enrollments') }} className="btn-primary w-full">View Sequence Progress</button>
            <button onClick={onClose} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Enroll Leads</h2>
            <p className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest mt-1">{sequenceName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] light:border-slate-200 pb-2">
            <span className="text-xs font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest">Select Leads</span>
            <button type="button" onClick={toggleAll} className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider hover:text-white transition-colors">
              {selectedLeads.size === leads.length && leads.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {fetchingLeads ? (
              <div className="flex justify-center py-6">
                <Loader2 size={24} className="text-[#00f0ff] animate-spin" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-6 text-[#b9cacb] light:text-slate-500 text-sm italic">
                No leads available to enroll.
              </div>
            ) : (
              leads.map(lead => (
                <div 
                  key={lead.id} 
                  onClick={() => toggleLead(lead.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedLeads.has(lead.id)
                      ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-white light:text-slate-900'
                      : 'bg-[#111114] border-[#27272A] light:bg-slate-50 light:border-slate-200 text-[#b9cacb] light:text-slate-600 hover:border-[#00f0ff]/30'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm">{lead.name}</h4>
                    <p className="text-[10px] mt-0.5">{lead.company}</p>
                  </div>
                  {selectedLeads.has(lead.id) ? (
                    <CheckSquare size={18} className="text-[#00f0ff]" />
                  ) : (
                    <Square size={18} className="text-slate-600 light:text-slate-400" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 light:border-slate-200 flex items-center justify-between mt-0">
            <span className="text-xs font-bold text-[#b9cacb] light:text-slate-500">
              {selectedLeads.size} selected
            </span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading || selectedLeads.size === 0}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enroll
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
