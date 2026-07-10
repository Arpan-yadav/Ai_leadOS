'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Download, Plus, MoreHorizontal, Mail, Linkedin, Globe, Zap, MessageSquare, Facebook, Sparkles, X, Trash2 } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import AddLeadModal from '@/components/leads/AddLeadModal'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'
import LeadsFilterModal from '@/components/leads/LeadsFilterModal'
import AIInsightsModal from '@/components/leads/AIInsightsModal'
import NewMessageModal from '@/components/communications/NewMessageModal'
import { getToken } from '@/lib/auth'
import toast from 'react-hot-toast'

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
  NEW: 'bg-[#00f0ff]/10 text-[#00f0ff] light:bg-blue-100 light:text-blue-700',
  CONTACTED: 'bg-amber-500/10 text-amber-500 light:bg-amber-100 light:text-amber-700',
  QUALIFIED: 'bg-emerald-500/10 text-emerald-500 light:bg-emerald-100 light:text-emerald-700',
  UNQUALIFIED: 'bg-white/10 text-[#b9cacb] light:bg-slate-100 light:text-slate-700',
  CONVERTED: 'bg-[#bd00ff]/10 text-[#bd00ff] light:bg-[#00a3ff]/10 light:text-[#00a3ff]',
}

const SourceIcon = ({ source }: { source: LeadSource }) => {
  switch (source) {
    case 'WHATSAPP': return <MessageSquare size={14} className="text-emerald-500" />
    case 'EMAIL':    return <Mail size={14} className="text-[#00f0ff] light:text-[#00a3ff]" />
    case 'META':     return <Facebook size={14} className="text-[#bd00ff] light:text-[#9d00ff]" />
    case 'LINKEDIN': return <Linkedin size={14} className="text-[#00f0ff] light:text-[#00a3ff]" />
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
  const [showFilters, setShowFilters]   = useState(false)
  const [insightLead, setInsightLead]   = useState<Lead | null>(null)
  const [emailLead, setEmailLead]       = useState<Lead | null>(null)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = getToken()
        const res = await fetch('http://localhost:3001/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch leads')
        const data = await res.json()
        // Handle both array response and {data: [...]} envelope
        const list = Array.isArray(data) ? data : (data.data ?? data.leads ?? [])
        setLeads(list)
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
    setLeads([newLead, ...leads])
    setShowModal(false)
  }

  const exportToCSV = () => {
    const headers = ['ID,Name,Company,Email,Status,Score,Source,Created At'];
    const rows = filteredLeads.map(lead => 
      `${lead.id},"${lead.name}","${lead.company}","${lead.email}",${lead.status},${lead.score},${lead.source},${lead.createdAt}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leads exported successfully!');
  }

  const deleteSelectedLeads = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Are you sure you want to delete the selected leads?')) return;

    setLoading(true);
    const token = getToken();
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`http://localhost:3001/api/leads/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      
      setLeads(leads.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      toast.success('Leads deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete leads');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight uppercase">Lead Universe</h1>
          <p className="text-[#b9cacb] light:text-slate-500 mt-1 font-medium italic">Multi-channel leads synchronized via AI Automation.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button onClick={deleteSelectedLeads} className="h-10 px-4 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 flex items-center gap-2 transition-all">
              <Trash2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Delete ({selectedIds.length})</span>
            </button>
          )}
          <button onClick={exportToCSV} className="btn-secondary h-10 flex items-center gap-2">
            <Download size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-10 flex items-center gap-2"
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
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-[#111114] light:bg-slate-100 rounded-lg p-1 border border-white/5 light:border-transparent">
            {CHANNELS.map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest transition-all ${
                  channel === ch ? 'bg-white/10 light:bg-white text-white light:text-slate-900 shadow-sm' : 'text-[#b9cacb] light:text-slate-500 hover:text-white light:hover:text-slate-900'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(true)} className="btn-secondary flex items-center gap-2">
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
              <tr className="border-b border-white/5 light:border-slate-100 bg-white/5 light:bg-slate-50/50">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-[#27272A] light:border-slate-300 bg-[#111114] light:bg-white text-[#00f0ff] light:text-[#00a3ff] focus:ring-[#00f0ff] light:focus:ring-[#00a3ff]"
                    checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">Lead</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">AI Pulse</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em]">Created</th>
                <th className="px-6 py-4 text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 light:divide-slate-100">
              {filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className={`group hover:bg-white/5 light:hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedIds.includes(lead.id) ? 'bg-[#00f0ff]/5 light:bg-[#00a3ff]/10' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-[#27272A] light:border-slate-300 bg-[#111114] light:bg-white text-[#00f0ff] light:text-[#00a3ff] focus:ring-[#00f0ff] light:focus:ring-[#00a3ff]"
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleId(lead.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#111114] light:bg-slate-100 border border-[#27272A] light:border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-[#00f0ff] light:text-[#00a3ff] font-bold text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white light:text-slate-900 group-hover:text-[#00f0ff] light:group-hover:text-[#00a3ff] transition-colors uppercase tracking-tight">{lead.name}</p>
                        <p className="text-[10px] text-[#b9cacb] light:text-slate-500 font-bold uppercase tracking-widest">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <SourceIcon source={lead.source} />
                      <span className="text-[10px] font-bold text-[#b9cacb] light:text-slate-600 uppercase tracking-tight">{lead.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-[#111114] light:bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${lead.score > 80 ? 'bg-emerald-500' : lead.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className={lead.score > 80 ? 'text-emerald-500' : 'text-[#b9cacb] light:text-slate-300'} />
                        <span className="text-[10px] font-black text-white light:text-slate-900">{lead.score}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-[#b9cacb] light:text-slate-400 font-black uppercase tracking-widest">
                    {lead.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setInsightLead(lead)} className="p-2 text-[#b9cacb] light:text-slate-400 hover:text-[#bd00ff] light:hover:text-[#9d00ff] hover:bg-white/5 light:hover:bg-slate-100 rounded-lg transition-all" title="AI Insights">
                        <Zap size={14} />
                      </button>
                      <button onClick={() => setEmailLead(lead)} className="p-2 text-[#b9cacb] light:text-slate-400 hover:text-[#00f0ff] light:hover:text-[#00a3ff] hover:bg-white/5 light:hover:bg-slate-100 rounded-lg transition-all" title="Send Email">
                        <Mail size={14} />
                      </button>
                      <button onClick={() => setSelectedLead(lead)} className="p-2 text-[#b9cacb] light:text-slate-400 hover:text-white light:hover:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 rounded-lg transition-all" title="More">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-white/5 light:border-slate-100 flex items-center justify-between bg-white/5 light:bg-slate-50/30">
          <p className="text-[10px] font-black text-[#b9cacb] light:text-slate-400 uppercase tracking-widest leading-none">Intelligence Hub Synchronized</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50" disabled>Prev</button>
            <button onClick={() => toast('Navigating to page 1')} className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest bg-white/10 light:bg-slate-200">1</button>
            <button onClick={() => toast('Navigating to page 2')} className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest">2</button>
            <button onClick={() => toast('Fetching next page of leads...')} className="btn-secondary py-1 px-3 text-[10px] font-black uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/80 light:bg-white/90 backdrop-blur-xl border border-white/10 light:border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-2xl px-6 py-3 flex items-center gap-6 animate-slide-up">
          <div className="flex items-center gap-2 border-r border-white/10 light:border-slate-200 pr-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00f0ff] text-black font-black text-xs">{selectedIds.length}</span>
            <span className="text-[10px] font-bold text-white light:text-slate-800 uppercase tracking-widest">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => toast.success('Enrolling leads into sequence')} className="btn-secondary h-8 flex items-center gap-2">
              <Sparkles size={14} className="text-[#bd00ff]" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Enroll Sequence</span>
            </button>
            <button onClick={() => toast.success('Exporting selected leads')} className="btn-secondary h-8 flex items-center gap-2">
              <Download size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Export</span>
            </button>
            <button onClick={() => setSelectedIds([])} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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

      {showFilters && <LeadsFilterModal onClose={() => setShowFilters(false)} />}
      
      <AIInsightsModal lead={insightLead} onClose={() => setInsightLead(null)} />
      
      {emailLead && (
        <NewMessageModal 
          onClose={() => setEmailLead(null)}
        />
      )}
    </div>
  )
}

export default LeadsPage