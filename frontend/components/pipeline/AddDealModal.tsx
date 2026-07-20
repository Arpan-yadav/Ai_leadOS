'use client'
import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface Lead {
  id: string
  name: string
  company: string
}

export default function AddDealModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (deal: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [fetchingLeads, setFetchingLeads] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  
  const [form, setForm] = useState({
    name: '',
    amount: '',
    stage: 'DISCOVERY',
    leadId: ''
  })

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${API_URL}/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const resData = await res.json()
          const list = resData.data || resData
          setLeads(list)
          if (list.length > 0) {
            setForm(f => ({ ...f, leadId: list[0].id }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch leads', err)
      } finally {
        setFetchingLeads(false)
      }
    }
    fetchLeads()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.amount || !form.leadId) {
      toast.error('Name, Amount, and Lead are required!')
      return
    }

    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`${API_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount)
        })
      })

      if (res.ok) {
        const createdDeal = await res.json();
        toast.success('Deal created successfully!')
        onAdd(createdDeal)
      } else {
        throw new Error('Failed to create deal')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating deal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50">
          <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Add New Deal</h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Deal Title *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="e.g. Enterprise License" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Amount ($) *</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="input-field" placeholder="15000" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Stage</label>
              <select name="stage" value={form.stage} onChange={handleChange} className="input-field appearance-none">
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Closed Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Lead *</label>
              <select name="leadId" value={form.leadId} onChange={handleChange} required className="input-field appearance-none">
                {fetchingLeads ? (
                  <option value="">Loading leads...</option>
                ) : leads.length === 0 ? (
                  <option value="">No leads available</option>
                ) : (
                  leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading || leads.length === 0}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
