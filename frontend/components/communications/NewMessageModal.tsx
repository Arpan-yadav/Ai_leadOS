'use client'
import React, { useState, useEffect } from 'react'
import { X, Loader2, Send, Sparkles, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function NewMessageModal({ onClose, onSent, lead: preselectedLead }: { onClose: () => void, onSent?: () => void, lead?: any }) {
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const [selectedLead, setSelectedLead] = useState<any>(preselectedLead || null)
  const [leadDropdownOpen, setLeadDropdownOpen] = useState(false)
  const [leadSearch, setLeadSearch] = useState('')

  // Account routing
  const [emailAccounts, setEmailAccounts] = useState<any[]>([])
  const [waAccounts, setWaAccounts] = useState<any[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('auto')

  const parsePhone = (phone: string) => {
    if (!phone) return { code: '+91', number: '' }
    const commonCodes = ['+91', '+44', '+61', '+1']
    for (const code of commonCodes) {
      if (phone.startsWith(code)) return { code, number: phone.slice(code.length) }
    }
    return { code: '+91', number: phone }
  }

  const getRecipientData = (channel: string, lead: any) => {
    if (!lead) return { recipient: '', countryCode: '+91' }
    if (channel === 'WHATSAPP') {
      const parsed = parsePhone(lead.phone || '')
      return { recipient: parsed.number, countryCode: parsed.code }
    }
    if (channel === 'EMAIL') return { recipient: lead.email || '', countryCode: '+91' }
    if (channel === 'LINKEDIN') return { recipient: lead.name || '', countryCode: '+91' }
    return { recipient: '', countryCode: '+91' }
  }

  const defaultChannel = preselectedLead?.source === 'WHATSAPP' ? 'WHATSAPP'
    : preselectedLead?.source === 'LINKEDIN' ? 'LINKEDIN' : 'EMAIL'

  const [form, setForm] = useState({
    channel: defaultChannel,
    countryCode: '+91',
    recipient: preselectedLead?.email || '',
    subject: '',
    message: ''
  })

  // Fetch all tenant leads for the picker
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = getToken()
        if (!token) return;
        const res = await fetch(`${API_URL}/leads?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setLeads(Array.isArray(data) ? data : (data.data ?? []))
        }
      } catch { /* silent */ }
    }
    fetchLeads()
    
    // Fetch user's Email and WhatsApp accounts for manual selection
    const fetchAccounts = async () => {
      try {
        const token = getToken()
        if (!token) return;
        const [emailRes, waRes] = await Promise.all([
          fetch(`${API_URL}/settings/email-accounts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/settings/whatsapp-accounts`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (emailRes.ok) setEmailAccounts(await emailRes.json());
        if (waRes.ok) setWaAccounts(await waRes.json());
      } catch { /* silent */ }
    }
    fetchAccounts();
  }, [])

  // Auto-update recipient when lead or channel changes
  useEffect(() => {
    if (selectedLead) {
      const data = getRecipientData(form.channel, selectedLead)
      setForm(prev => ({ ...prev, recipient: data.recipient, countryCode: data.countryCode }))
    }
  }, [selectedLead, form.channel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLeadSelect = (lead: any) => {
    setSelectedLead(lead)
    setLeadDropdownOpen(false)
    setLeadSearch('')
  }

  const handleAIGenerate = async () => {
    const leadName = selectedLead?.name || form.recipient || 'Prospect'
    const company = selectedLead?.company || 'Their Company'

    setAiLoading(true)
    try {
      const token = getToken()

      // Fetch past conversation for this lead if available
      let history = ''
      if (selectedLead?.id) {
        try {
          const histRes = await fetch(`${API_URL}/communications?leadId=${selectedLead.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (histRes.ok) {
            const msgs = await histRes.json()
            if (Array.isArray(msgs) && msgs.length > 0) {
              history = msgs.slice(-5).map((m: any) =>
                `${m.direction === 'inbound' ? leadName : 'You'}: ${m.content}`
              ).join('\n')
            }
          }
        } catch { /* non-critical */ }
      }

      const res = await fetch(`${API_URL}/communications/generate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leadName,
          company,
          context: `${form.channel} — ${form.subject || 'Follow up'}`,
          leadId: selectedLead?.id,
          history,
        })
      })

      const data = await res.json()
      if (data.message) {
        setForm(prev => ({
          ...prev,
          message: data.message,
          // Auto-fill subject if AI returned one AND subject is currently empty or default
          subject: data.subject ? data.subject : prev.subject
        }))
        toast.success(history ? '✨ Follow-up + subject generated with AI context!' : '✨ AI Draft Generated — subject & message ready!')
      }
    } catch {
      toast.error('Failed to generate message')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipient || !form.message) {
      toast.error('Recipient and Message are required!')
      return
    }
    try {
      setLoading(true)
      const token = getToken()
      const res = await fetch(`${API_URL}/communications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          leadId: selectedLead?.id,
          recipient: (form.channel === 'WHATSAPP' && !form.recipient.startsWith('+'))
            ? `${form.countryCode}${form.recipient}` : form.recipient,
          channel: form.channel,
          content: form.message,
          subject: form.subject,
          accountId: selectedAccountId === 'auto' ? undefined : selectedAccountId
        })
      })
      if (!res.ok) throw new Error('Failed to send')
      const responseData = await res.json()
      if (form.channel === 'LINKEDIN') {
        navigator.clipboard.writeText(form.message).catch(() => {})
        toast.success('Message copied! Opening LinkedIn...')
        window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(form.recipient)}`, '_blank')
      } else if (responseData.previewUrl) {
        toast.success('Email sent! Check terminal for preview link.', { duration: 5000 })
      } else {
        toast.success('Message sent successfully!')
      }
      if (onSent) onSent()
      else onClose()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.company?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-visible animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50">
          <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Send size={18} className="text-[#00f0ff]" />
            New Message
          </h2>
          <button type="button" onClick={onClose} className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Lead Picker */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">
              Select Lead *
            </label>
            <div
              className="input-field cursor-pointer flex items-center justify-between"
              onClick={() => setLeadDropdownOpen(!leadDropdownOpen)}
            >
              <span className={selectedLead ? 'text-white' : 'text-slate-500'}>
                {selectedLead
                  ? `${selectedLead.name} — ${selectedLead.company}`
                  : '-- Pick a lead from your CRM --'
                }
              </span>
              <ChevronDown size={14} className={`transition-transform ${leadDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {leadDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-[#0A0A0C] light:bg-white border border-[#27272A] rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                <div className="p-2 border-b border-[#27272A]">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search leads..."
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-500 px-2"
                  />
                </div>
                {filteredLeads.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-500">No leads found</p>
                ) : filteredLeads.map(l => (
                  <div
                    key={l.id}
                    onClick={() => handleLeadSelect(l)}
                    className={`p-3 cursor-pointer text-xs border-b border-[#27272A] last:border-0 hover:bg-white/5 transition-colors ${selectedLead?.id === l.id ? 'bg-[#00f0ff]/10 text-[#00f0ff]' : 'text-white'}`}
                  >
                    <span className="font-bold">{l.name}</span>
                    <span className="ml-2 text-slate-400">{l.company}</span>
                    <span className="ml-2 text-slate-500 text-[10px]">{l.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Channel + Recipient */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block">Channel</label>
              <select name="channel" value={form.channel} onChange={handleChange} className="input-field appearance-none">
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="META">Meta Ads</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block">Recipient *</label>
              {form.channel === 'WHATSAPP' ? (
                <div className="flex gap-2">
                  <select
                    className="input-field w-28 shrink-0"
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+971">+971 (AE)</option>
                    <option value="+65">+65 (SG)</option>
                  </select>
                  <input type="text" name="recipient" value={form.recipient} onChange={handleChange} required className="input-field flex-1" placeholder="Phone Number" />
                </div>
              ) : (
                <input type="text" name="recipient" value={form.recipient} onChange={handleChange} required className="input-field" placeholder="Email, Phone, or ID" />
              )}
            </div>
          </div>

          {/* Account Selection */}
          {(form.channel === 'EMAIL' || form.channel === 'WHATSAPP') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block">Send From Account</label>
              <select 
                value={selectedAccountId} 
                onChange={e => setSelectedAccountId(e.target.value)} 
                className="input-field appearance-none w-full"
              >
                <option value="auto">🌟 AI Auto-Select (Max Limit Saver)</option>
                {form.channel === 'EMAIL' && emailAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.provider} - {acc.smtpUser || acc.id.slice(-4)} (Quota: {acc.sentToday}/{acc.dailyLimit})
                  </option>
                ))}
                {form.channel === 'WHATSAPP' && waAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    Meta Cloud API - ID: {acc.waPhoneNumberId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.channel === 'EMAIL' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="Message Subject" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">Message *</label>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-[#bd00ff]/10 border border-[#bd00ff]/30 text-[#bd00ff] hover:bg-[#bd00ff]/20 transition-all disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {aiLoading ? 'Generating...' : selectedLead ? '✨ Generate with AI Context' : '✨ Generate with AI'}
              </button>
            </div>
            {selectedLead && (
              <p className="text-[9px] text-[#bd00ff]/60 font-mono mb-1">
                AI will use {selectedLead.name}'s business profile + conversation history
              </p>
            )}
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="input-field resize-y"
              placeholder="Type your message or click Generate with AI..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
