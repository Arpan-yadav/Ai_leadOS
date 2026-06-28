import React from 'react'
import StatusBadge from '../../components/ui/StatusBadge'
import ScoreBadge from '../../components/ui/ScoreBadge'


const LeadsPage = () => {

  const mockLeads = [
    {
      id: 1,
      name: "John Smith",
      company: "Tech Corp",
      email: "john@techcorp.com",
      status: "NEW" as const,
      score: 85,
      source: "LINKEDIN",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      company: "Design Studio",
      email: "sarah@design.com",
      status: "CONTACTED" as const,
      score: 62,
      source: "EMAIL",
    },
    {
      id: 3,
      name: "Rahul Sharma",
      company: "Digital Agency",
      email: "rahul@digital.com",
      status: "QUALIFIED" as const,
      score: 91,
      source: "WHATSAPP",
    }
  ]

  return (
    <div style={{ padding: "24px" }}>

      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Leads
      </h1>

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
          {mockLeads.map((lead) => (
            <tr key={lead.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "12px" }}>{lead.name}</td>
              <td style={{ padding: "12px" }}>{lead.company}</td>
              <td style={{ padding: "12px" }}>{lead.email}</td>
              <td style={{ padding: "12px" }}>
                <StatusBadge status={lead.status} />
              </td>
              <td style={{ padding: "12px" }}>
  <ScoreBadge score={lead.score} />
</td>
              <td style={{ padding: "12px" }}>{lead.source}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}

export default LeadsPage