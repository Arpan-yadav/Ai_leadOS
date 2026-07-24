'use client'
import React from 'react'
import { X, DollarSign, Building2, User, Calendar, Bot, Mail, MessageSquare } from 'lucide-react'

import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function DealDetailModal({ deal: initialDeal, onClose }: { deal: any, onClose: () => void }) {
  const [deal, setDeal] = React.useState(initialDeal)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchDeal = async () => {
      try {
        const token = getToken()
        const res = await fetch(`${API_URL}/deals/${initialDeal.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setDeal(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDeal()
  }, [initialDeal.id])

  if (!deal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl overflow-hidden flex flex-col animate-fade-in shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-black/20 light:bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
              <Building2 size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-800 tracking-tight">{deal.title}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{deal.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 light:bg-slate-50 border border-white/10 light:border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-[#00f0ff]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deal Value</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white light:text-slate-800">${(deal.amount ?? deal.value ?? 0).toLocaleString()}</h3>
                </div>
                <div className="p-4 rounded-xl bg-white/5 light:bg-slate-50 border border-white/10 light:border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-[#bd00ff]" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</span>
                  </div>
                  <h3 className="text-sm font-bold text-white light:text-slate-800 mt-2">{deal.lead?.name ?? 'N/A'}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{deal.lead?.company ?? deal.company ?? 'Unknown Company'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Next Best Action</h4>
                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-start gap-3">
                  <Bot size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-300 light:text-slate-700">Follow up on the technical proposal sent 3 days ago. They opened the email 2 hours ago.</p>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-colors flex items-center gap-2">
                        <Mail size={12} /> Send Follow-up
                      </button>
                      <button className="px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs font-bold transition-colors flex items-center gap-2">
                        <MessageSquare size={12} /> WhatsApp ping
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity Timeline</h4>
              <div className="relative pl-3 space-y-4 before:absolute before:inset-y-0 before:left-2.75 before:w-px before:bg-white/10 light:before:bg-slate-200">
                
                {loading ? (
                  <div className="text-xs text-slate-500">Loading timeline...</div>
                ) : deal.activities && deal.activities.length > 0 ? (
                  deal.activities.map((activity: any, i: number) => {
                    const isFirst = i === 0;
                    return (
                      <div key={activity.id} className="relative pl-6">
                        <div className={`absolute -left-1.25 top-1 w-3 h-3 rounded-full border-2 border-[#16161D] light:border-white ${isFirst ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-500'} z-10`} />
                        <p className={`text-xs font-bold ${isFirst ? 'text-white light:text-slate-800' : 'text-slate-300 light:text-slate-700'}`}>
                          {activity.type === 'pipeline' ? 'Stage Update' : activity.type}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{activity.content}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-xs text-slate-500">No recent activity.</div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
