import React from 'react'

const ScoreBadge = ({ score }: { score: number }) => {
  const getStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${getStyle(score)}`}>
        #{score}
      </span>
    </div>
  )
}

export default ScoreBadge