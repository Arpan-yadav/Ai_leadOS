'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2, Sparkles, TrendingUp, AlertTriangle, Crosshair, ChevronRight } from 'lucide-react'
import { getToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface AIInsight {
  id: string
  analysis: string
  opportunities: string[]
  risks: string[]
  nextAction: string
  sentiment: 'positive' | 'neutral' | 'negative'
  qualityScore: number
  createdAt: string
  lead: {
    id: string
    name: string
    company: string
  }
}

export default function AIIntelligencePage() {
  const [leads, setLeads] = useState<any[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const token = getToken()
  const router = useRouter()

  useEffect(() => {
    // Fetch leads to populate the dropdown
    const fetchLeads = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setLeads(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch leads', err)
      }
    }
    fetchLeads()
  }, [token])

  const handleAnalyze = async () => {
    if (!selectedLeadId) return
    setLoading(true)
    setError(null)
    setInsight(null)

    try {
      const res = await fetch(`http://localhost:3001/api/leads/${selectedLeadId}/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Analysis failed')
      }

      const data = await res.json()
      setInsight(data)
    } catch (err) {
      setError('Failed to generate AI insights. Please ensure the backend is running and Gemini API key is valid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent p-8 overflow-y-auto relative z-10">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#bd00ff] rounded-full mix-blend-screen filter blur-[200px] opacity-10 animate-pulse pointer-events-none -z-10" />

      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white light:text-slate-800 tracking-tight flex items-center gap-3 uppercase">
          <div className="p-2.5 bg-[#bd00ff]/10 light:bg-indigo-50 text-[#bd00ff] light:text-indigo-600 rounded-2xl shadow-[0_0_15px_rgba(189,0,255,0.2)] border border-[#bd00ff]/20">
            <Sparkles size={24} />
          </div>
          AI Intelligence Center
        </h1>
        <p className="text-[#b9cacb] light:text-slate-500 mt-2 font-mono text-[11px] uppercase tracking-wider">Deep-dive company audits and strategic opportunity analysis powered by Gemini.</p>
      </header>

      <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row gap-4 items-end max-w-4xl border border-[#27272A] light:border-slate-200">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-mono font-bold text-[#b9cacb] light:text-slate-500 uppercase tracking-wider mb-2">Select a Target Lead</label>
          <select 
            value={selectedLeadId} 
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="">-- Choose a Lead to Analyze --</option>
            {leads.map(lead => (
              <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={!selectedLeadId || loading}
          className="btn-primary h-[42px] px-8 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin mr-2" /> Analyzing...</>
          ) : (
            <><Sparkles size={16} className="mr-2" /> Run AI Audit</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#ff007a]/10 border border-[#ff007a]/30 text-[#ff007a] rounded-xl mb-8 max-w-4xl text-sm font-bold">
          {error}
        </div>
      )}

      {insight && (
        <div className="max-w-4xl space-y-6 animate-slide-up">
          {/* Executive Summary & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 bg-transparent border-[#bd00ff]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#bd00ff]/10 light:bg-indigo-50 blur-[40px] pointer-events-none" />
              <h3 className="text-[12px] font-bold text-[#bd00ff] light:text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                <Sparkles size={16} className="text-[#bd00ff] light:text-indigo-600" />
                Executive Analysis
              </h3>
              <p className="text-[#e5e1e4] light:text-slate-700 leading-relaxed text-[14px]">
                {insight.analysis}
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group border-[#00f0ff]/30">
              <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-[10px] font-mono font-bold text-[#b9cacb] light:text-slate-500 uppercase tracking-wider mb-2">AI Fitness Score</h3>
              <div className="text-5xl font-display font-black text-white light:text-slate-800 tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] group-hover:text-[#00f0ff] light:text-blue-600 transition-colors">
                {insight.qualityScore}
                <span className="text-2xl text-[#52525B]">/100</span>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black uppercase tracking-widest border
                ${insight.sentiment === 'positive' ? 'bg-[#00f0ff]/10 light:bg-blue-50 text-[#00f0ff] light:text-blue-600 border-[#00f0ff]/30' : 
                  insight.sentiment === 'negative' ? 'bg-[#ff007a]/10 text-[#ff007a] border-[#ff007a]/30' : 
                  'bg-[#b9cacb]/10 text-[#b9cacb] light:text-slate-500 border-[#b9cacb]/30'}`}
              >
                {insight.sentiment} Signal
              </span>
            </div>
          </div>

          {/* Opportunities and Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-l-4 border-l-[#00f0ff] border-t-[#27272A] border-r-[#27272A] border-b-[#27272A] bg-transparent">
              <h3 className="text-[12px] font-mono font-bold text-[#00f0ff] light:text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#00f0ff] light:text-blue-600" />
                Growth Opportunities
              </h3>
              <ul className="space-y-3">
                {insight.opportunities?.map((opp, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#e5e1e4] light:text-slate-700 text-[13px]">
                    <ChevronRight size={16} className="text-[#00f0ff] light:text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-[#ff007a] border-t-[#27272A] border-r-[#27272A] border-b-[#27272A] bg-transparent">
              <h3 className="text-[12px] font-mono font-bold text-[#ff007a] uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#ff007a]" />
                Identified Risks
              </h3>
              <ul className="space-y-3">
                {insight.risks?.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#e5e1e4] light:text-slate-700 text-[13px]">
                    <ChevronRight size={16} className="text-[#ff007a] shrink-0 mt-0.5" />
                    <span className="leading-snug">{risk}</span>
                  </li>
                ))}
                {(!insight.risks || insight.risks.length === 0) && (
                  <li className="text-[#b9cacb] light:text-slate-500 text-[13px] font-mono italic">No significant risks identified in this pass.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Next Best Action */}
          <div className="glass-card p-6 bg-[#16161D] light:bg-white border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff] rounded-full mix-blend-screen filter blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[12px] font-mono font-black text-[#00f0ff] light:text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
              <Crosshair size={16} />
              Next Best Action Recommendation
            </h3>
            <p className="text-lg font-bold leading-relaxed relative z-10 text-white light:text-slate-800 font-display">
              "{insight.nextAction}"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
