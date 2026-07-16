'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Users, Target, Sparkles, Loader2, AlertTriangle, Trophy, Zap, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, FunnelChart, Funnel, LabelList, Cell,
  PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const COLORS = ['#00f0ff', '#bd00ff', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];

function MetricCard({ icon: Icon, label, value, sub, color = 'text-[#00f0ff]', bg = 'bg-[#00f0ff]/10' }: any) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={14} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-[#b9cacb] mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center">
        <Icon size={15} className="text-[#00f0ff]" />
      </div>
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest">{title}</h2>
        {sub && <p className="text-[10px] text-[#b9cacb]">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-[11px]">
      <p className="text-[#00f0ff] font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? `$${p.value.toLocaleString()}` : p.value}</span></p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [velocity, setVelocity] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, rRes, vRes, tRes, aRes, pRes] = await Promise.all([
        fetch(`${API}/analytics/funnel`,      { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/revenue`,     { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/velocity`,    { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/team`,        { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/anomalies`,   { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/predictions`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (fRes.ok) setFunnel(await fRes.json());
      if (rRes.ok) setRevenue(await rRes.json());
      if (vRes.ok) setVelocity(await vRes.json());
      if (tRes.ok) setTeam(await tRes.json());
      if (aRes.ok) setAnomalies(await aRes.json());
      if (pRes.ok) setPredictions(await pRes.json());
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const generateAiSummary = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(`${API}/analytics/ai-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setAiSummary(await res.json()); toast.success('AI summary generated!'); }
      else toast.error('Failed to generate summary');
    } catch { toast.error('Network error'); } finally { setLoadingAI(false); }
  };

  const totalRevenue = revenue.reduce((s, r) => s + r.revenue, 0);
  const wonRevenue = revenue.find(r => r.stage === 'Won')?.revenue || 0;
  const topPerfomer = team[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-[#b9cacb]">
        <Loader2 size={20} className="animate-spin text-[#00f0ff]" />
        <span className="font-mono text-sm uppercase tracking-widest">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Analytics & Reporting</h1>
          <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">
            Real-time performance · Funnel · Pipeline · Team
          </p>
        </div>
        <button
          onClick={generateAiSummary}
          disabled={loadingAI}
          className="btn-primary flex items-center gap-2"
        >
          {loadingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Weekly Summary
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users}      label="Total Funnel Leads" value={funnel.find(f => f.stage === 'New')?.count ?? 0} sub="in pipeline top" color="text-[#00f0ff]" bg="bg-[#00f0ff]/10" />
        <MetricCard icon={Target}     label="Won Revenue"        value={`$${wonRevenue.toLocaleString()}`} sub="closed deals"  color="text-emerald-400" bg="bg-emerald-400/10" />
        <MetricCard icon={Clock}      label="Avg. Close Time"    value={velocity?.avgDays ? `${velocity.avgDays}d` : '—'} sub="lead to conversion" color="text-[#bd00ff]" bg="bg-[#bd00ff]/10" />
        <MetricCard icon={Trophy}     label="Top Performer"      value={topPerfomer?.name?.split(' ')[0] || '—'} sub={`${topPerfomer?.dealsWon ?? 0} deals won`} color="text-[#ff007a]" bg="bg-[#ff007a]/10" />
      </div>

      {/* AI Weekly Summary */}
      {aiSummary && (
        <div className="glass-card p-6 border border-[#00f0ff]/20 bg-[#00f0ff]/3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-[#00f0ff]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mb-1">AI Weekly Report</p>
              <p className="text-base font-bold text-white mb-2">{aiSummary.headline}</p>
              <p className="text-[13px] text-[#b9cacb] mb-4 leading-relaxed">{aiSummary.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Highlights</p>
                  {aiSummary.highlights?.map((h: string, i: number) => (
                    <p key={i} className="text-[12px] text-[#b9cacb] flex items-start gap-2 mb-1">
                      <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 shrink-0" />{h}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Warnings</p>
                  {aiSummary.warnings?.map((w: string, i: number) => (
                    <p key={i} className="text-[12px] text-[#b9cacb] flex items-start gap-2 mb-1">
                      <AlertTriangle size={11} className="text-amber-400 mt-0.5 shrink-0" />{w}
                    </p>
                  ))}
                  <div className="mt-3 p-3 bg-[#bd00ff]/10 border border-[#bd00ff]/20 rounded-xl">
                    <p className="text-[10px] font-black text-[#bd00ff] uppercase tracking-widest mb-1">This Week's Action</p>
                    <p className="text-[12px] text-white">{aiSummary.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel + Revenue Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="glass-card p-6">
          <SectionHeader icon={Target} title="Conversion Funnel" sub="Leads by stage (top to bottom)" />
          <div className="space-y-2">
            {funnel.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-24 text-right text-[10px] font-bold text-[#b9cacb] uppercase">{stage.stage}</div>
                <div className="flex-1 h-8 bg-[#27272A] rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                    style={{
                      width: `${Math.max(stage.pct, 3)}%`,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}33, ${COLORS[i % COLORS.length]})`,
                    }}
                  >
                    <span className="text-[10px] font-black text-white">{stage.count}</span>
                  </div>
                </div>
                <div className="w-10 text-[10px] font-bold text-[#b9cacb]">{stage.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Pipeline by Stage */}
        <div className="glass-card p-6">
          <SectionHeader icon={BarChart3} title="Revenue Pipeline" sub="Deal value by stage ($)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="stage" tick={{ fill: '#b9cacb', fontSize: 10 }} />
              <YAxis tick={{ fill: '#b9cacb', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {revenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Velocity */}
      {velocity?.trend?.length > 0 && (
        <div className="glass-card p-6">
          <SectionHeader icon={Clock} title="Lead Velocity" sub={`Avg ${velocity.avgDays} days to convert · Min ${velocity.minDays}d · Max ${velocity.maxDays}d`} />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={velocity.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="week" tick={{ fill: '#b9cacb', fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: '#b9cacb', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#b9cacb', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="converted" name="Conversions" stroke="#00f0ff" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="avgDays" name="Avg Days" stroke="#bd00ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Team Leaderboard */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#27272A]">
          <SectionHeader icon={Trophy} title="Team Leaderboard" sub="Ranked by performance score" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272A]">
                {['Rank', 'Member', 'Role', 'Leads', 'Deals Won', 'Revenue', 'Activities', 'Score'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-[#b9cacb] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {team.map((member, i) => (
                <tr key={member.id} className={`hover:bg-white/2 transition-colors ${i === 0 ? 'bg-[#ff007a]/3' : ''}`}>
                  <td className="px-5 py-4">
                    <span className={`text-lg font-black ${i === 0 ? 'text-[#ff007a]' : i === 1 ? 'text-[#b9cacb]' : 'text-[#b9cacb]/50'}`}>
                      {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 flex items-center justify-center text-[10px] font-bold text-[#00f0ff]">
                        {member.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold text-[#b9cacb] uppercase">{member.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white font-mono">{member.leadsOwned}</td>
                  <td className="px-5 py-4 text-sm font-mono text-emerald-400 font-bold">{member.dealsWon}</td>
                  <td className="px-5 py-4 text-sm font-mono text-white">${(member.revenue / 1000).toFixed(1)}k</td>
                  <td className="px-5 py-4 text-sm font-mono text-[#b9cacb]">{member.activitiesLogged}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#27272A] rounded-full overflow-hidden w-16">
                        <div
                          className="h-full bg-linear-to-r from-[#00f0ff] to-[#bd00ff] rounded-full"
                          style={{ width: `${Math.min(100, (member.score / (team[0]?.score || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#00f0ff]">{member.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictive Deal Probabilities */}
      {predictions.length > 0 && (
        <div className="glass-card p-6">
          <SectionHeader icon={Zap} title="Deal Close Predictions" sub="AI-scored probability for open deals" />
          <div className="space-y-3">
            {predictions.slice(0, 8).map(deal => (
              <div key={deal.id} className="flex items-center gap-4 py-2 border-b border-[#27272A] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{deal.title}</p>
                  <p className="text-[10px] text-[#b9cacb]">{deal.company} · {deal.stage}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#b9cacb]">Expected</p>
                  <p className="text-sm font-bold text-emerald-400">${deal.expectedRevenue.toLocaleString()}</p>
                </div>
                <div className="w-24">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#b9cacb]">Close prob.</span>
                    <span className={`text-[10px] font-bold ${deal.probability >= 60 ? 'text-emerald-400' : deal.probability >= 35 ? 'text-amber-400' : 'text-[#b9cacb]'}`}>{deal.probability}%</span>
                  </div>
                  <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${deal.probability}%`,
                        background: deal.probability >= 60 ? '#10b981' : deal.probability >= 35 ? '#f59e0b' : '#b9cacb',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies && (anomalies.staleLeads.length > 0 || anomalies.highValueAtRisk.length > 0) && (
        <div className="glass-card p-6 border border-amber-500/20">
          <SectionHeader icon={AlertTriangle} title="Anomaly Detection" sub={`${anomalies.summary.staleCount} stale leads · ${anomalies.summary.highValueAtRisk} high-value at risk`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3">Stale Leads ({anomalies.staleLeads.length})</p>
              {anomalies.staleLeads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-[#27272A] last:border-0">
                  <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">{lead.name}</p>
                    <p className="text-[10px] text-[#b9cacb]">{lead.company} · {lead.status}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 shrink-0">{lead.daysSinceActivity}d inactive</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#ff007a] uppercase tracking-widest mb-3">High-Value At Risk ({anomalies.highValueAtRisk.length})</p>
              {anomalies.highValueAtRisk.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-[#27272A] last:border-0">
                  <ArrowUpRight size={11} className="text-[#ff007a] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">{lead.name}</p>
                    <p className="text-[10px] text-[#b9cacb]">{lead.company}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#00f0ff] shrink-0">Score: {lead.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
