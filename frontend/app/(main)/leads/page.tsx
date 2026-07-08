'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Plus, MoreHorizontal, Mail, Linkedin, Globe, Zap, MessageSquare, Facebook, Sparkles } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import AddLeadModal from '@/components/leads/AddLeadModal'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'
import { getToken } from '@/lib/auth'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED'
type LeadSource = 'LINKEDIN' | 'EMAIL' | 'WHATSAPP' | 'META' | 'REFERRAL'

interface Lead {
  id: string
  name: string
  company: string
  email: string
  status: LeadStatus
  score: number
  source: LeadSource
  createdAt: string
}

const statusColors: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  QUALIFIED: 'bg-emerald-100 text-emerald-700',
  UNQUALIFIED: 'bg-slate-100 text-slate-700',
  CONVERTED: 'bg-brand-100 text-brand-700',
}

const SourceIcon = ({ source }: { source: LeadSource }) => {
  switch (source) {
    case 'WHATSAPP': return <MessageSquare size={14} className="text-emerald-500" />
    case 'EMAIL':    return <Mail size={14} className="text-blue-500" />
    case 'META':     return <Facebook size={14} className="text-brand-600" />
    case 'LINKEDIN': return <Linkedin size={14} className="text-blue-600" />
    default:         return <Globe size={14} className="text-slate-400" />
  }
}

const CHANNELS = ['All', 'WhatsApp', 'Meta', 'Email', 'LinkedIn']


const LeadsPage = () => {
  const router = useRouter()
  const [search, setSearch]             = useState('')
  const [channel, setChannel]           = useState('All')
  const [showModal, setShowModal]       = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [leads, setLeads]               = useState<Lead[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = getToken()
        const res = await fetch('http://localhost:3001/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch leads')
        const data = await res.json()
        // API returns { data: Lead[], meta: ... }
        setLeads(data.data || [])
      } catch (error) {
        console.error('Error fetching leads:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase())
    const matchesChannel = channel === 'All' ||
      lead.source.toLowerCase().includes(channel.toLowerCase())
    return matchesSearch && matchesChannel
  })

  const toggleId = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const toggleAll = () =>
    setSelectedIds(selectedIds.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id))

  const handleAddLead = (newLead: any) => {
    setLeads([...leads, { ...newLead, id: Math.random().toString(), status: 'NEW' as const, createdAt: new Date().toISOString().slice(0, 10) }])
    setShowModal(false)
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Lead Universe</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Multi-channel leads synchronized via AI Automation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary h-10 flex items-center gap-2">
            <Download size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-10 flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Plus size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Add Lead</span>
          </button>
        </div>
      </header>

      {/* Filters & Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            {CHANNELS.map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest transition-all ${
                  channel === ch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
          </button>
        </div>
      </div>

      {/* Lead Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Pulse</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className={`group hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedIds.includes(lead.id) ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleId(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${lead.name}`} className="w-10 h-10 object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{lead.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <SourceIcon source={lead.source} />
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{lead.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${lead.score > 80 ? 'bg-emerald-500' : lead.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className={lead.score > 80 ? 'text-emerald-500' : 'text-slate-300'} />
                        <span className="text-[10px] font-black text-slate-900">{lead.score}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {lead.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="AI Insights">
                        <Zap size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all" title="Send Email">
                        <Mail size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="More">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Intelligence Hub Synchronized</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50" disabled>Prev</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest active:bg-brand-50">1</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">2</button>
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddLead}
        />
      )}

      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  )
}

export default LeadsPage