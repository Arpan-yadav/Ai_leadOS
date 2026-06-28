import React from 'react'

const Skeleton = ({ width = "100%", height = "20px" }: { width?: string, height?: string }) => {
  return (
    <div style={{
      width: width,
      height: height,
      backgroundColor: "#e5e7eb",
      borderRadius: "6px",
      animation: "pulse 1.5s infinite",
    }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export const TableSkeleton = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Skeleton width="150px" height="32px" />
      <div style={{ marginTop: "16px" }}>
        {[1,2,3,4,5].map((i) => (
          <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            <Skeleton width="150px" height="20px" />
            <Skeleton width="120px" height="20px" />
            <Skeleton width="200px" height="20px" />
            <Skeleton width="80px" height="20px" />
            <Skeleton width="60px" height="20px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton