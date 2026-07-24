'use client'
import React, { useState } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface Step {
  day: number
  channel: string
  title: string
}

export default function AddSequenceModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationDays: 7
  })
  const [steps, setSteps] = useState<Step[]>([
    { day: 1, channel: 'EMAIL', title: 'Intro & Value Prop' }
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const addStep = () => {
    const lastDay = steps.length > 0 ? steps[steps.length - 1].day : 0
    setSteps([...steps, { day: lastDay + 2, channel: 'EMAIL', title: '' }])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const handleStepChange = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: field === 'day' ? Number(value) : value }
    setSteps(newSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Sequence Name is required!')
      return
    }
    if (steps.length === 0) {
      toast.error('Please add at least one step!')
      return
    }

    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`${API_URL}/sequences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          durationDays: Number(form.durationDays),
          steps
        })
      })

      if (!res.ok) throw new Error('Failed to create sequence')

      toast.success('Sequence created successfully!')
      onAdd()
    } catch (err: any) {
      toast.error(err.message || 'Error creating sequence')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Build Sequence</h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#00f0ff] uppercase tracking-widest border-b border-[#00f0ff]/20 pb-2">Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-3">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Sequence Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="e.g. Q4 High-Value Outreach" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Duration (Days)</label>
                <input type="number" name="durationDays" value={form.durationDays} onChange={handleChange} required min="1" className="input-field" />
              </div>
              <div className="space-y-1 md:col-span-4">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Briefly describe the goal of this sequence..." />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#bd00ff]/20 pb-2">
              <h3 className="text-xs font-black text-[#bd00ff] uppercase tracking-widest">Cadence Steps</h3>
              <button type="button" onClick={addStep} className="text-[10px] font-bold text-[#bd00ff] hover:text-[#bd00ff]/80 flex items-center gap-1 uppercase bg-[#bd00ff]/10 px-2 py-1 rounded">
                <Plus size={12} /> Add Step
              </button>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start glass-card p-3 border-[#27272A] light:border-slate-200">
                  <div className="w-16 shrink-0 space-y-1">
                    <label className="text-[9px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Day</label>
                    <input type="number" min="1" value={step.day} onChange={(e) => handleStepChange(idx, 'day', e.target.value)} className="input-field text-center p-2" />
                  </div>
                  <div className="w-32 shrink-0 space-y-1">
                    <label className="text-[9px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Channel</label>
                    <select value={step.channel} onChange={(e) => handleStepChange(idx, 'channel', e.target.value)} className="input-field p-2 appearance-none text-[13px]">
                      <option value="email">Email</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="meta">Meta Ads</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <label className="text-[9px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Title</label>
                    <input type="text" value={step.title} onChange={(e) => handleStepChange(idx, 'title', e.target.value)} className="input-field p-2" placeholder="e.g. Intro & Value Prop" required />
                  </div>
                  <button type="button" onClick={() => removeStep(idx)} className="mt-5 p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm italic">
                  No steps added yet. Click "Add Step" to begin building your sequence.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 light:border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-[#111114] light:bg-white -m-6 p-6 mt-0">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Sequence
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
