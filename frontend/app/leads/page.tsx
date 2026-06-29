'use client'
import React, { useState } from 'react'
import StatusBadge from '../../components/ui/StatusBadge'
import ScoreBadge from '../../components/ui/ScoreBadge'
import SearchBar from '../../components/ui/SearchBar'
import AddLeadModal from '../../components/leads/AddLeadModal'
import LeadDetailPanel from '../../components/leads/LeadDetailPanel'

const LeadsPage = () => {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [leads, setLeads] = useState([
    { id: 1, name: "John Smith", company: "Tech Corp", email: "john@techcorp.com", status: "NEW" as const, score: 85, source: "LINKEDIN" },
    { id: 2, name: "Sarah Johnson", company: "Design Studio", email: "sarah@design.com", status: "CONTACTED" as const, score: 62, source: "EMAIL" },
    { id: 3, name: "Rahul Sharma", company: "Digital Agency", email: "rahul@digital.com", status: "QUALIFIED" as const, score: 91, source: "WHATSAPP" }
  ])

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase()) ||
    lead.company.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddLead = (newLead: any) => {
    setLeads([...leads, { ...newLead, status: "NEW" as const }])
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">Lead Universe</h1>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.2em]">Multi-channel leads</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Lead
        </button>
      </header>

      <SearchBar onSearch={setSearch} />

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Pulse</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-brand-100 text-brand-700 flex items-center justify-center font-bold font-display">
                      {lead.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{lead.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600 font-medium">{lead.company}</td>
                <td className="px-4 py-4 text-slate-500">{lead.email}</td>
                <td className="px-4 py-4"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-4"><ScoreBadge score={lead.score} /></td>
                <td className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{lead.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
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