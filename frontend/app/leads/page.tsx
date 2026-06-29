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
    <div style={{ padding: "24px" }}>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Leads</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          + Add Lead
        </button>
      </div>

      <SearchBar onSearch={setSearch} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Company</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Score</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Source</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              style={{
                borderBottom: "1px solid #e5e7eb",
                cursor: "pointer"
              }}
            >
              <td style={{ padding: "12px" }}>{lead.name}</td>
              <td style={{ padding: "12px" }}>{lead.company}</td>
              <td style={{ padding: "12px" }}>{lead.email}</td>
              <td style={{ padding: "12px" }}><StatusBadge status={lead.status} /></td>
              <td style={{ padding: "12px" }}><ScoreBadge score={lead.score} /></td>
              <td style={{ padding: "12px" }}>{lead.source}</td>
            </tr>
          ))}
        </tbody>
      </table>

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