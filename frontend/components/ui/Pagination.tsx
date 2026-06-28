'use client'
import React from 'react'

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}: {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}) => {

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginTop: "16px",
      fontSize: "14px"
    }}>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          color: currentPage === 1 ? "#9ca3af" : "#374151"
        }}
      >
        Previous
      </button>

      <span style={{ color: "#6b7280" }}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          border: "1px solid #d1d5db",
          backgroundColor: currentPage === totalPages ? "#f3f4f6" : "white",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          color: currentPage === totalPages ? "#9ca3af" : "#374151"
        }}
      >
        Next
      </button>

      <span style={{ color: "#9ca3af" }}>
        Total: {totalItems} leads
      </span>

    </div>
  )
}

export default Pagination