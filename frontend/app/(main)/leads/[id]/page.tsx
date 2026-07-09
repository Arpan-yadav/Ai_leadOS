'use client';
/**
 * @file app/(main)/leads/[id]/page.tsx
 * @description Lead 360° Detail Page — Sprint 3, Frontend Team (Harshwardhan)
 * Features: Full lead profile, Activity Timeline, Task Management sidebar
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Globe, Linkedin, Building2, Zap, CheckCircle2,
  Circle, Plus, Loader2, MessageSquare, PhoneCall, FileText, Sparkles, Clock, Edit2, X, Check
} from 'lucide-react';
import { getToken } from '@/lib/auth';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Activity {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  user?: { name: string };
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: string;
}

interface AIInsight {
  id: string;
  analysis: string;
  sentiment: string;
  qualityScore: number;
  nextAction?: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  status: string;
  source: string;
  score?: number;
  createdAt: string;
  activities: Activity[];
  tasks: Task[];
  deals: Deal[];
  aiInsights: AIInsight[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    email:    <Mail size={12} className="text-blue-500" />,
    call:     <PhoneCall size={12} className="text-green-500" />,
    whatsapp: <MessageSquare size={12} className="text-emerald-500" />,
    note:     <FileText size={12} className="text-amber-500" />,
    pipeline: <Zap size={12} className="text-indigo-500" />,
    ai_automation: <Sparkles size={12} className="text-purple-500" />,
  };
  return <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-[#27272A] shrink-0">{icons[type] ?? <FileText size={12} className="text-slate-400" />}</span>;
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    CONTACTED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    QUALIFIED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    UNQUALIFIED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    CONVERTED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  const token = getToken();

  const fetchLead = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lead not found');
      const data = await res.json();
      setLead(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:3001/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLead();
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  const handleUndoTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:3001/api/tasks/${taskId}/undo`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLead();
    } catch (err) {
      console.error('Failed to undo task', err);
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    try {
      await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editingTaskTitle }),
      });
      setEditingTaskId(null);
      fetchLead();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTaskTitle, leadId: id, priority: 'medium' }),
      });
      setNewTaskTitle('');
      fetchLead();
    } catch (err) {
      console.error('Failed to add task', err);
    } finally {
      setAddingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">{error ?? 'Lead not found'}</p>
        <button onClick={() => router.back()} className="mt-4 text-[#00f0ff] hover:underline text-sm">← Go back</button>
      </div>
    );
  }

  const latestInsight = lead.aiInsights?.[0];

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-slate-50/50 dark:bg-[#0A0A0C]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 dark:text-[#b9cacb] hover:text-[#00f0ff] text-sm mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Leads
        </button>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Lead Profile + Activity */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            {/* Lead Card */}
            <div className="bg-white dark:bg-[#111114] rounded-xl border border-slate-200 dark:border-[#27272A] p-6 shadow-sm dark:shadow-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}&backgroundType=gradientLinear`}
                    alt={lead.name}
                    className="w-14 h-14 rounded-full border-2 border-white dark:border-[#27272A] shadow-md"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">{lead.name}</h1>
                    <p className="text-slate-500 dark:text-[#b9cacb] text-sm">{lead.title ?? 'No title'} at <strong className="text-slate-700 dark:text-slate-300">{lead.company}</strong></p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-[#27272A] dark:text-[#b9cacb] px-2 py-0.5 rounded-full">{lead.source}</span>
                    </div>
                  </div>
                </div>

                {/* AI Score */}
                {lead.score != null && (
                  <div className="flex flex-col items-center bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-4 py-3">
                    <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400 mb-1" />
                    <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{lead.score}</span>
                    <span className="text-[9px] text-indigo-400 dark:text-indigo-500 uppercase font-bold tracking-widest">AI Pulse</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-[#27272A]">
                {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#b9cacb] hover:text-[#00f0ff] transition-colors"><Mail size={13} className="text-slate-400" />{lead.email}</a>}
                {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#b9cacb] hover:text-[#00f0ff] transition-colors"><Phone size={13} className="text-slate-400" />{lead.phone}</a>}
                {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#b9cacb] hover:text-[#00f0ff] transition-colors"><Globe size={13} className="text-slate-400" />{lead.website}</a>}
                {lead.linkedin && <a href={lead.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#b9cacb] hover:text-[#00f0ff] transition-colors"><Linkedin size={13} className="text-slate-400" />LinkedIn Profile</a>}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#b9cacb]"><Building2 size={13} className="text-slate-400" />{lead.company}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#b9cacb]"><Clock size={13} className="text-slate-400" />Added {timeAgo(lead.createdAt)}</div>
              </div>
            </div>

            {/* AI Insight Panel */}
            {latestInsight && (
              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} className="text-indigo-500 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm text-indigo-800 dark:text-indigo-300">AI Analysis</h3>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ml-auto
                    ${latestInsight.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : latestInsight.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                    {latestInsight.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#b9cacb] leading-relaxed mb-3">{latestInsight.analysis}</p>
                {latestInsight.nextAction && (
                  <div className="flex items-start gap-2 bg-white/70 dark:bg-[#111114] rounded-lg p-2.5 border border-indigo-100 dark:border-indigo-500/20">
                    <Zap size={12} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">{latestInsight.nextAction}</p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-[#111114] rounded-xl border border-slate-200 dark:border-[#27272A] p-5 shadow-sm dark:shadow-none">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Activity Timeline</h3>
              {lead.activities.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-[#5a6474] text-center py-6">No activities logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {lead.activities.map((activity, i) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <ActivityIcon type={activity.type} />
                        {i < lead.activities.length - 1 && <div className="w-px h-4 bg-slate-100 dark:bg-[#27272A] mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-xs text-slate-700 dark:text-[#e5e1e4] leading-relaxed">{activity.content}</p>
                        <span className="text-[10px] text-slate-400 dark:text-[#5a6474]">{timeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deals */}
            {lead.deals.length > 0 && (
              <div className="bg-white dark:bg-[#111114] rounded-xl border border-slate-200 dark:border-[#27272A] p-5 shadow-sm dark:shadow-none">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Active Deals ({lead.deals.length})</h3>
                <div className="space-y-2">
                  {lead.deals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0A0A0C] rounded-lg border border-slate-100 dark:border-[#27272A]">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-white">{deal.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#b9cacb] capitalize">{deal.stage.toLowerCase()}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ${deal.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Task Management Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#111114] rounded-xl border border-slate-200 dark:border-[#27272A] p-5 shadow-sm dark:shadow-none sticky top-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Task Management</h3>

              {/* Add Task Input */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a task..."
                  className="flex-1 text-xs border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#0A0A0C] text-slate-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/20 transition-all placeholder:text-slate-400 dark:placeholder:text-[#5a6474]"
                />
                <button
                  onClick={handleAddTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="p-2 rounded-lg bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/30 text-[#00f0ff] disabled:opacity-50 transition-all"
                >
                  {addingTask ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                </button>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lead.tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-[#5a6474] text-center py-6">No tasks yet. Add one above!</p>
                ) : (
                  lead.tasks.map((task) => (
                    <div key={task.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all group
                      ${task.status === 'completed'
                        ? 'bg-slate-50 dark:bg-[#0A0A0C] border-slate-100 dark:border-[#1a1a1f] opacity-60'
                        : 'bg-white dark:bg-[#16161D] border-slate-200 dark:border-[#27272A] hover:border-[#00f0ff]/40'}`}
                    >
                      <button
                        onClick={() => task.status !== 'completed' ? handleCompleteTask(task.id) : handleUndoTask(task.id)}
                        className="mt-0.5 shrink-0"
                        title={task.status === 'completed' ? 'Undo task' : 'Complete task'}
                      >
                        {task.status === 'completed'
                          ? <CheckCircle2 size={15} className="text-emerald-500 hover:text-slate-400 transition-colors" />
                          : <Circle size={15} className="text-slate-300 dark:text-[#5a6474] hover:text-[#00f0ff] transition-colors" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        {editingTaskId === task.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTask(task.id)}
                              className="flex-1 text-xs border border-slate-300 dark:border-[#27272A] bg-white dark:bg-[#0A0A0C] text-slate-700 dark:text-white rounded px-2 py-1 focus:outline-none focus:border-[#00f0ff]"
                            />
                            <button onClick={() => handleUpdateTask(task.id)} className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-1 rounded">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingTaskId(null)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-[#27272A] p-1 rounded">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start group">
                            <p className={`text-xs font-medium leading-snug ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-[#5a6474]' : 'text-slate-700 dark:text-[#e5e1e4]'}`}>
                              {task.title}
                            </p>
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  setEditingTaskId(task.id);
                                  setEditingTaskTitle(task.title);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#00f0ff] p-1 transition-opacity"
                                title="Edit task"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded
                            ${task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : task.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-[#27272A] dark:text-[#b9cacb]'}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-[9px] text-slate-400 dark:text-[#5a6474]">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
