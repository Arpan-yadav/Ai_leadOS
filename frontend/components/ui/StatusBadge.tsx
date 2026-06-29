import React from 'react'

type Status = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED'

const StatusBadge = ({ status }: { status: Status }) => {
  const styles: { [key in Status]: string } = {
    NEW: 'bg-blue-100 text-blue-700',
    CONTACTED: 'bg-amber-100 text-amber-700',
    QUALIFIED: 'bg-emerald-100 text-emerald-700',
    UNQUALIFIED: 'bg-red-100 text-red-700',
    CONVERTED: 'bg-purple-100 text-purple-700',
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  )
}

export default StatusBadge