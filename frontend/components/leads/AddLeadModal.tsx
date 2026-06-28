'use client'
import React, { useState } from 'react'

const AddLeadModal = ({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (lead: any) => void
}) => {

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    source: 'EMAIL'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.company) {
      alert('Name, Email and Company are required!')
      return
    }
    onAdd({ ...form, id: Date.now(), status: 'NEW', score: 0 })
    onClose()
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        width: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Add New Lead</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>

        {[
          { label: "Name *", name: "name", type: "text" },
          { label: "Email *", name: "email", type: "email" },
          { label: "Company *", name: "company", type: "text" },
          { label: "Title", name: "title", type: "text" },
          { label: "Phone", name: "phone", type: "text" },
        ].map((field) => (
          <div key={field.name} style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "4px" }}>
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", color: "#374151", display: "block", marginBottom: "4px" }}>
            Source
          </label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          >
            <option>EMAIL</option>
            <option>WHATSAPP</option>
            <option>LINKEDIN</option>
            <option>WEBSITE</option>
            <option>REFERRAL</option>
            <option>COLD_OUTREACH</option>
            <option>META_LEADS</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            Add Lead
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddLeadModal