import React from 'react'

type Status = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED'

const StatusBadge = ({ status }: { status: Status }) => {

  const styles: { [key in Status]: React.CSSProperties } = {
    NEW: { backgroundColor: "#dbeafe", color: "#1e40af" },
    CONTACTED: { backgroundColor: "#fef9c3", color: "#854d0e" },
    QUALIFIED: { backgroundColor: "#dcfce7", color: "#166534" },
    UNQUALIFIED: { backgroundColor: "#fee2e2", color: "#991b1b" },
    CONVERTED: { backgroundColor: "#f3e8ff", color: "#6b21a8" },
  }

  return (
    <span style={{
      ...styles[status],
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block"
    }}>
      {status}
    </span>
  )
}

export default StatusBadge