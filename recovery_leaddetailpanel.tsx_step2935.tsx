'use client'
import React from 'react'
import StatusBadge from '../ui/StatusBadge'
import ScoreBadge from '../ui/ScoreBadge'

const LeadDetailPanel = ({ lead, onClose }: {
  lead: any
  onClose: () => void
}) => {

  return (
    <div style={{
      position: "fixed",
      top: 0, right: 0,
      width: "380px",
      height: "100%",
      backgroundColor: "white",
      boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
      zIndex: 1000,
      padding: "24px",
      overflowY: "auto"
    }}>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Lead Details</h2>
        <button
          onClick={onClose}
          style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <div style={{
          width: "60px", height: "60px",
          borderRadius: "50%",
          backgroundColor: "#dbeafe",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: "600", color: "#1e40af",
          marginBottom: "12px"
        }}>
          {lead.name.charAt(0).toUpperCase()}
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: "600" }}>{lead.name}</h3>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{lead.title || "No title"}</p>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>

        {[
          { label: "Company", value: lead.company },
          { label: "Email", value: lead.email },
          { label: "Phone", value: lead.phone || "Not provided" },
          { label: "Source", value: lead.source },
        ].map((item) => (
          <div key={item.label} style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "14px", color: "#111827", fontWeight: "500" }}>
              {item.value}
            </p>
          </div>
        ))}

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>Status</p>
          <StatusBadge status={lead.status} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>AI Score</p>
          <ScoreBadge score={lead.score} />
        </div>

      </div>

    </div>
  )
}

export default LeadDetailPanel