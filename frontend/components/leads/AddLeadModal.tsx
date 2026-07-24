'use client'
import React, { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AddLeadModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd?: (lead: any) => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    countryCode: '+1',
    source: 'EMAIL'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.company) {
      toast.error('Name, Email and Company are required!')
      return
    }

    try {
      setLoading(true)
      const token = getToken()
      const payload = {
        ...form,
        phone: form.phone ? `${form.countryCode}${form.phone}` : ''
      }
      
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create lead')

      const data = await res.json()
      toast.success('Lead created successfully!')
      
      if (onAdd) {
        onAdd(data)
      } else {
        onClose()
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50">
          <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase">Add New Lead</h2>
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
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Full Name" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="Email Address" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Company *</label>
              <input type="text" name="company" value={form.company} onChange={handleChange} required className="input-field" placeholder="Company Name" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Job Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Job Title" />
            </div>
            {/* Phone Number */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Phone Number</label>
              <div className="flex gap-2">
                <select 
                  name="countryCode" 
                  value={form.countryCode} 
                  onChange={handleChange}
                  className="input-field w-25 bg-[#111114] light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-lg text-white light:text-slate-900 focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+55">+55 (BR)</option>
                  <option value="+52">+52 (MX)</option>
                  <option value="+7">+7 (RU)</option>
                  <option value="+27">+27 (ZA)</option>
                  <option value="+82">+82 (KR)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+39">+39 (IT)</option>
                  <option value="+971">+971 (AE)</option>
                  <option value="+966">+966 (SA)</option>
                  <option value="+65">+65 (SG)</option>
                  <option value="+60">+60 (MY)</option>
                  <option value="+62">+62 (ID)</option>
                  <option value="+66">+66 (TH)</option>
                  <option value="+64">+64 (NZ)</option>
                  <option value="+46">+46 (SE)</option>
                  <option value="+47">+47 (NO)</option>
                  <option value="+45">+45 (DK)</option>
                  <option value="+31">+31 (NL)</option>
                  <option value="+32">+32 (BE)</option>
                  <option value="+41">+41 (CH)</option>
                  <option value="+43">+43 (AT)</option>
                  <option value="+353">+353 (IE)</option>
                  <option value="+48">+48 (PL)</option>
                  <option value="+90">+90 (TR)</option>
                  <option value="+20">+20 (EG)</option>
                  <option value="+234">+234 (NG)</option>
                  <option value="+254">+254 (KE)</option>
                </select>
                <input 
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  className="input-field flex-1" 
                  placeholder="e.g. 555-0123" 
                />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Source</label>
              <select name="source" value={form.source} onChange={handleChange} className="input-field appearance-none">
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="META">Meta Ads</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}