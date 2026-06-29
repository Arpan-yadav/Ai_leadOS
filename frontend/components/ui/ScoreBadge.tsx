import React from 'react'

const ScoreBadge = ({ score }: { score: number }) => {

  const getStyle = (score: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
      border: "1px solid"
    }

    if (score >= 70) {
      return { ...base, backgroundColor: "#bbf7d0", color: "#166534", borderColor: "#6ee7b7" }
    } else if (score >= 40) {
      return { ...base, backgroundColor: "#fef08a", color: "#854d0e", borderColor: "#fcd34d" }
    } else {
      return { ...base, backgroundColor: "#fecaca", color: "#991b1b", borderColor: "#fca5a5" }
    }
  }

  return (
    <span style={getStyle(score)}>
      {score}
    </span>
  )
}

export default ScoreBadge