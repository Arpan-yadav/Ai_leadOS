'use client'
import React, { useState } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewMessageModal({ onClose, onSent, lead }: { onClose: () => void, onSent?: () => void, lead?: any }) {
  const [loading, setLoading] = useState(false)
  const defaultChannel = lead?.email ? 'EMAIL' : lead?.source === 'WHATSAPP' ? 'WHATSAPP' : lead?.source === 'LINKEDIN' ? 'LINKEDIN' : 'EMAIL'
  
  const parsePhone = (phone: string) => {
    if (!phone) return { code: '+1', number: '' }
    const commonCodes = ['+91', '+44', '+61', '+1']
    for (const code of commonCodes) {
      if (phone.startsWith(code)) {
        return { code, number: phone.slice(code.length) }
      }
    }
    return { code: '+1', number: phone } // fallback
  }

  const getRecipientData = (channel: string) => {
    if (!lead) return { recipient: '', countryCode: '+1' }
    if (channel === 'WHATSAPP') {
      const parsed = parsePhone(lead.phone || '')
      return { recipient: parsed.number, countryCode: parsed.code }
    }
    if (channel === 'EMAIL') return { recipient: lead.email || '', countryCode: '+1' }
    if (channel === 'LINKEDIN') return { recipient: lead.name || '', countryCode: '+1' }
    return { recipient: '', countryCode: '+1' }
  }

  const initialData = getRecipientData(defaultChannel)

  const [form, setForm] = useState({
    recipient: initialData.recipient,
    channel: defaultChannel,
    countryCode: initialData.countryCode,
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newForm = { ...form, [name]: value }
    
    // Auto-update recipient when channel changes
    if (name === 'channel' && lead) {
      const data = getRecipientData(value)
      newForm.recipient = data.recipient
      newForm.countryCode = data.countryCode
    }
    
    setForm(newForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipient || !form.message) {
      toast.error('Recipient and Message are required!')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3001/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: (form.channel === 'WHATSAPP' && !form.recipient.startsWith('+')) ? `${form.countryCode}${form.recipient}` : form.recipient,
          channel: form.channel,
          content: form.message,
          subject: form.subject
        })
      })
      
      if (!res.ok) throw new Error('Failed to send')
      const responseData = await res.json()
      if (form.channel === 'LINKEDIN') {
        navigator.clipboard.writeText(form.message).catch(() => {})
        toast.success('Message copied! Opening LinkedIn...')
        window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(form.recipient)}`, '_blank')
      } else if (responseData.previewUrl) {
        toast.success('Email sent! Check terminal or Ethereal for the preview link.', { duration: 5000 })
        console.log('Ethereal Email Preview URL:', responseData.previewUrl)
      } else {
        toast.success('Message sent successfully!')
      }

      if (onSent) onSent()
      else onClose()
    } catch (err: any) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }
  const handleAIGenerate = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      // Determine dummy company/lead name based on recipient or use defaults
      const leadName = lead?.name || form.recipient || 'Prospect'
      const company = lead?.company || 'Their Company'

      const res = await fetch('http://localhost:3001/api/communications/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leadName, company, context: form.subject || form.channel })
      })
      const data = await res.json()
      if (data.message) {
        setForm(prev => ({ ...prev, message: data.message }))
        toast.success('AI Draft Generated!')
      }
    } catch (err) {
      toast.error('Failed to generate message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg overflow-hidden animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50">
          <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Send size={18} className="text-[#00f0ff]" />
            New Message
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Channel</label>
                <select name="channel" value={form.channel} onChange={handleChange} className="input-field appearance-none">
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="META">Meta Ads</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Recipient *</label>
                {form.channel === 'WHATSAPP' ? (
                  <div className="flex gap-2">
                    <select 
                      className="input-field appearance-none w-[100px] shrink-0"
                      value={form.countryCode}
                      onChange={(e) => setForm({...form, countryCode: e.target.value})}
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                    </select>
                    <input type="text" name="recipient" value={form.recipient} onChange={handleChange} required className="input-field flex-1" placeholder="Phone Number" />
                  </div>
                ) : (
                  <input type="text" name="recipient" value={form.recipient} onChange={handleChange} required className="input-field" placeholder="Email, Phone, or ID" />
                )}
              </div>
            </div>

            {form.channel === 'EMAIL' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Subject</label>
                <input type="text" name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="Message Subject" />
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-[#b9cacb] light:text-slate-500 uppercase tracking-widest block">Message *</label>
                <button 
                  type="button" 
                  onClick={handleAIGenerate} 
                  disabled={loading}
                  className="text-[10px] font-bold text-[#bd00ff] light:text-purple-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  ✨ Generate with AI
                </button>
              </div>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                required 
                rows={5}
                className="input-field resize-y min-h-[100px] max-h-[400px]" 
                placeholder="Type your message here..." 
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
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
