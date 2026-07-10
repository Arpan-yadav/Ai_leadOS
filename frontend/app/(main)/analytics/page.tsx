'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, Database, LayoutTemplate, Search, Filter, ChevronUp, ChevronDown, Plus, X, ArrowUpDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getToken } from '@/lib/auth';

const PIE_COLORS = ['#00f0ff', '#bd00ff', '#10b981', '#f43f5e', '#f59e0b'];

const EXPLORER_DATA = {
  'Lead Sources': {
    data: [
      { name: 'Inbound', value: 45 },
      { name: 'Outbound', value: 30 },
      { name: 'Referral', value: 15 },
      { name: 'Organic', value: 10 },
    ],
    config: { key: 'value' }
  },
  'Score vs Value': {
    data: [
      { score: 85, value: 12000, name: 'TechCorp', size: 400 },
      { score: 62, value: 5000, name: 'GlobalNet', size: 200 },
      { score: 91, value: 24000, name: 'Innova', size: 600 },
      { score: 45, value: 2000, name: 'BetaLLC', size: 100 },
      { score: 78, value: 15000, name: 'AlphaInc', size: 450 },
      { score: 95, value: 35000, name: 'Omega', size: 800 },
      { score: 55, value: 8000, name: 'Zeta', size: 250 },
    ],
    config: { x: 'score', y: 'value', z: 'size', label: 'name' }
  },
  'Stage Conversion': {
    data: [
      { name: 'Lead', count: 500 },
      { name: 'Contacted', count: 320 },
      { name: 'Discovery', count: 180 },
      { name: 'Proposal', count: 90 },
      { name: 'Negotiation', count: 45 },
      { name: 'Won', count: 25 },
    ],
    config: { key: 'count' }
  },
  'Revenue by Channel': {
    data: [
      { name: 'Mon', email: 4000, linkedin: 2400, whatsapp: 2400 },
      { name: 'Tue', email: 3000, linkedin: 1398, whatsapp: 2210 },
      { name: 'Wed', email: 2000, linkedin: 9800, whatsapp: 2290 },
      { name: 'Thu', email: 2780, linkedin: 3908, whatsapp: 2000 },
      { name: 'Fri', email: 1890, linkedin: 4800, whatsapp: 2181 },
      { name: 'Sat', email: 2390, linkedin: 3800, whatsapp: 2500 },
      { name: 'Sun', email: 3490, linkedin: 4300, whatsapp: 2100 },
    ],
    config: { keys: ['email', 'linkedin', 'whatsapp'] }
  },
  'Activity Metrics': {
    data: [
      { subject: 'Emails Sent', A: 120, B: 110, fullMark: 150 },
      { subject: 'Calls Made', A: 98, B: 130, fullMark: 150 },
      { subject: 'Meetings', A: 86, B: 130, fullMark: 150 },
      { subject: 'Demos', A: 99, B: 100, fullMark: 150 },
      { subject: 'Proposals', A: 85, B: 90, fullMark: 150 },
      { subject: 'Closes', A: 65, B: 85, fullMark: 150 },
    ],
    config: { key: 'A', secondaryKey: 'B' }
  }
};

const VISUALIZATIONS = ['Bar Chart', 'Line Chart', 'Donut/Pie', 'Radar/Spider', 'Scatter Plot'];

export default function AnalyticsPage() {
  const [activeDataset, setActiveDataset] = useState('Score vs Value');
  const [activeViz, setActiveViz] = useState('Scatter Plot');
  const [filterText, setFilterText] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<{col: string, op: string, val: string}[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc'|'desc'} | null>(null);

  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const currentDataset = EXPLORER_DATA[activeDataset as keyof typeof EXPLORER_DATA];

  const processedData = React.useMemo(() => {
    let result = [...currentDataset.data];

    if (filterText) {
      result = result.filter((row: any) => 
        Object.values(row).some(val => String(val).toLowerCase().includes(filterText.toLowerCase()))
      );
    }

    filters.forEach(f => {
      if (!f.col || !f.val) return;
      result = result.filter(row => {
        const rowVal = row[f.col];
        if (rowVal === undefined || rowVal === null) return false;
        
        const isNum = typeof rowVal === 'number';
        const strVal = String(rowVal).toLowerCase();
        const fValStr = f.val.toLowerCase();
        const fValNum = Number(f.val);

        switch(f.op) {
          case 'eq': return isNum ? rowVal === fValNum : strVal === fValStr;
          case 'contains': return strVal.includes(fValStr);
          case 'gt': return isNum ? rowVal > fValNum : strVal > fValStr;
          case 'lt': return isNum ? rowVal < fValNum : strVal < fValStr;
          default: return true;
        }
      });
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.dir === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [currentDataset, filterText, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key && current.dir === 'asc') return { key, dir: 'desc' };
      if (current?.key === key && current.dir === 'desc') return null;
      return { key, dir: 'asc' };
    });
  };

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/ai/analytics-insight', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ range: activeDataset, metrics: currentDataset.data }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      } else {
        toast.error('Failed to generate insights');
      }
    } catch (err) {
      toast.error('Error generating insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const renderChart = () => {
    const data = currentDataset.data;
    const config = currentDataset.config as any;

    if (!data || data.length === 0) return <div className="p-8 text-center text-slate-500">No data available for this selection.</div>;

    switch (activeViz) {
      case 'Bar Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={config.label || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '8px' }} />
              {config.keys ? (
                config.keys.map((k: string, i: number) => <Bar key={k} dataKey={k} fill={PIE_COLORS[i % PIE_COLORS.length]} radius={[4,4,0,0]} />)
              ) : (
                <Bar dataKey={config.key || config.y || 'value'} fill="#00f0ff" radius={[4,4,0,0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Line Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={config.label || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(189,0,255,0.2)', borderRadius: '8px' }} />
              {config.keys ? (
                config.keys.map((k: string, i: number) => <Line key={k} type="monotone" dataKey={k} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />)
              ) : (
                <Line type="monotone" dataKey={config.key || config.y || 'value'} stroke="#bd00ff" strokeWidth={3} dot={{ r: 6, fill: '#16161D', strokeWidth: 2 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'Area Chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey={config.label || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} />
              <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '8px' }} />
              {config.keys ? (
                config.keys.map((k: string, i: number) => <Area key={k} type="monotone" dataKey={k} stroke={PIE_COLORS[i % PIE_COLORS.length]} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.2} />)
              ) : (
                <Area type="monotone" dataKey={config.key || config.y || 'value'} stroke="#00f0ff" fillOpacity={1} fill="url(#colorUv)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'Donut/Pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={activeViz === 'Donut/Pie' ? 80 : 0}
                outerRadius={120}
                paddingAngle={5}
                dataKey={config.key || config.y || 'value'}
                stroke="none"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'Radar/Spider':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey={config.label || 'subject'} tick={{ fill: '#b9cacb', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
              <Radar name="Metric A" dataKey={config.key || config.y || 'A'} stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.3} />
              {config.secondaryKey && (
                <Radar name="Metric B" dataKey={config.secondaryKey} stroke="#bd00ff" fill="#bd00ff" fillOpacity={0.3} />
              )}
              <Tooltip contentStyle={{ background: '#16161D', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '8px' }} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'Scatter Plot':
        // Specifically customized beautiful scatter
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis type="number" dataKey={config.x || 'score'} name="Score" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} domain={[0, 100]} />
              <YAxis type="number" dataKey={config.y || 'value'} name="Value" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#b9cacb' }} tickFormatter={(val) => `$${val/1000}k`} />
              <ZAxis type="number" dataKey={config.z || 'size'} range={[50, 600]} name="Volume" />
              <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} contentStyle={{ background: 'rgba(22, 22, 29, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,240,255,0.1)' }} />
              <Scatter data={data} fill="#00f0ff" shape="circle" fillOpacity={0.7}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Select a valid visualization</div>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in min-h-[calc(100vh-2rem)] flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-3">
            <span className="p-2 bg-[#bd00ff]/10 text-[#bd00ff] rounded-xl border border-[#bd00ff]/30 shadow-[0_0_15px_rgba(189,0,255,0.2)]">
              <Database size={20} />
            </span>
            Visual Analytics Explorer
          </h1>
          <p className="text-[#b9cacb] mt-2 font-mono text-[11px] uppercase tracking-widest">Interactive, self-serve data visualization and exploration tool.</p>
        </div>
      </header>

      {/* Explorer Controls */}
      <div className="glass-panel p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/5 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/5 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database size={14} className="text-emerald-400" />
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Dataset</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(EXPLORER_DATA).map(ds => (
                <button
                  key={ds}
                  onClick={() => setActiveDataset(ds)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${
                    activeDataset === ds
                      ? 'bg-[#bd00ff]/10 text-[#bd00ff] border border-[#bd00ff]/30 shadow-[0_0_15px_rgba(189,0,255,0.2)]'
                      : 'bg-black/20 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {ds}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutTemplate size={14} className="text-[#00f0ff]" />
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Visualization Type</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {VISUALIZATIONS.map(viz => (
                <button
                  key={viz}
                  onClick={() => setActiveViz(viz)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider flex items-center gap-2 ${
                    activeViz === viz
                      ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-black/20 text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeViz === viz ? 'bg-[#00f0ff] animate-pulse' : 'bg-slate-600'}`} />
                  {viz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="glass-card flex-1 flex flex-col border border-white/5 relative overflow-hidden min-h-[400px]">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <span className="text-[#00f0ff] font-black text-xs uppercase tracking-widest">{activeDataset}</span>
            <span className="text-slate-600 font-black text-xs">—</span>
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">via {activeViz}</span>
          </div>
        </div>
        <div className="flex-1 relative min-h-[350px] w-full p-6">
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/20 pointer-events-none" />
          <div className="absolute inset-0 p-6 z-10">
            {renderChart()}
          </div>
        </div>
      </div>

      {/* AI Data Scientist Section */}
      <div className="glass-card border border-[#bd00ff]/30 shadow-[0_0_30px_rgba(189,0,255,0.1)] p-6 md:p-8 relative overflow-hidden group shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#bd00ff]/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#bd00ff]/10 border border-[#bd00ff]/30 text-[#bd00ff] shadow-[0_0_15px_rgba(189,0,255,0.2)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">AI Data Scientist</h2>
              <p className="text-[11px] text-[#b9cacb] font-mono tracking-widest uppercase mt-0.5">Automated Revenue Intelligence</p>
            </div>
          </div>
          <button 
            onClick={generateInsights} 
            disabled={loadingInsights}
            className="btn-primary flex items-center gap-2 bg-linear-to-r from-[#bd00ff] to-[#00f0ff] hover:opacity-90 shadow-[0_0_20px_rgba(189,0,255,0.3)] disabled:opacity-50"
          >
            {loadingInsights ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Insights for {activeDataset}
          </button>
        </div>

        <div className="relative z-10 transition-all">
          {loadingInsights && (
            <div className="py-12 flex flex-col items-center justify-center text-[#bd00ff] animate-pulse">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="font-mono text-xs uppercase tracking-widest">Analyzing {activeDataset} via Gemini...</p>
            </div>
          )}
          
          {!loadingInsights && !aiInsights && (
            <div className="py-8 text-center text-[#b9cacb] italic font-mono text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
              Click &quot;Generate Insights&quot; to have Gemini analyze your currently selected dataset.
            </div>
          )}

          {!loadingInsights && aiInsights && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#111114]/50 border border-white/5 p-5 rounded-xl">
                <h4 className="text-[10px] font-black text-[#bd00ff] uppercase tracking-widest mb-2">Executive Summary</h4>
                <p className="text-sm text-white leading-relaxed">{aiInsights.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111114]/50 border border-white/5 p-5 rounded-xl">
                  <h4 className="text-[10px] font-black text-[#00f0ff] uppercase tracking-widest mb-3">Key Insights</h4>
                  <ul className="space-y-3">
                    {aiInsights.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#b9cacb]">
                        <span className="text-[#00f0ff] mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-[#111114]/50 border border-white/5 p-5 rounded-xl">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Recommended Actions</h4>
                  <ul className="space-y-3">
                    {aiInsights.recommendedActions.map((action: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#b9cacb]">
                        <span className="text-emerald-400 mt-0.5">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="glass-panel p-6 border border-white/5 shadow-xl relative overflow-hidden shrink-0 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#00f0ff]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{activeDataset} - Raw Data</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search any field..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full h-8 pl-9 pr-3 bg-black/20 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-8 px-3 flex items-center gap-2 rounded-lg border text-xs font-bold transition-all ${showAdvanced ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]' : 'bg-black/20 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Filter size={14} />
              Advanced
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mb-4 p-4 rounded-lg bg-black/20 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Filters</h4>
              <button 
                onClick={() => setFilters([...filters, {col: Object.keys(currentDataset.data[0])[0], op: 'contains', val: ''}])}
                className="text-[10px] font-bold text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Add Rule
              </button>
            </div>
            {filters.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select 
                  value={f.col} 
                  onChange={e => {
                    const newF = [...filters];
                    newF[idx].col = e.target.value;
                    setFilters(newF);
                  }}
                  className="h-8 px-2 bg-[#111114] border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-[#00f0ff]/50"
                >
                  {Object.keys(currentDataset.data[0] || {}).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select 
                  value={f.op}
                  onChange={e => {
                    const newF = [...filters];
                    newF[idx].op = e.target.value;
                    setFilters(newF);
                  }}
                  className="h-8 px-2 bg-[#111114] border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-[#00f0ff]/50"
                >
                  <option value="contains">Contains</option>
                  <option value="eq">Equals</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  value={f.val}
                  onChange={e => {
                    const newF = [...filters];
                    newF[idx].val = e.target.value;
                    setFilters(newF);
                  }}
                  className="flex-1 h-8 px-3 bg-[#111114] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00f0ff]/50"
                />
                <button onClick={() => setFilters(filters.filter((_, i) => i !== idx))} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            {filters.length === 0 && <p className="text-xs text-slate-500 italic">No advanced filters active.</p>}
          </div>
        )}
        
        <div className="overflow-x-auto rounded-lg border border-white/5 bg-black/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                {Object.keys(currentDataset.data[0] || {}).map(key => (
                  <th key={key} onClick={() => handleSort(key)} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group select-none">
                    <div className="flex items-center gap-1">
                      {key}
                      <span className="text-slate-600 group-hover:text-[#00f0ff] transition-colors">
                        {sortConfig?.key === key ? (sortConfig.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={10} />}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                  {Object.keys(currentDataset.data[0] || {}).map((key: string, j: number) => (
                    <td key={j} className="px-4 py-2 text-xs text-slate-300">{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {processedData.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Filter size={24} className="text-slate-700 mx-auto" />
              No matching data found for your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
