'use client'

import React, { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Undo2, 
  AlertCircle,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  completedAt: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New Task State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [suggestingTasks, setSuggestingTasks] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const responseBody = await res.json();
      const list = Array.isArray(responseBody) ? responseBody : (responseBody.data ?? responseBody.tasks ?? []);
      setTasks(list);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title: newTaskTitle,
          priority: newTaskPriority,
          status: 'pending'
        })
      });
      
      if (!res.ok) throw new Error('Failed to create task');
      
      const created = await res.json();
      setTasks([created, ...tasks]);
      setNewTaskTitle('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const token = getToken();
      const endpoint = task.status === 'pending' 
        ? `http://localhost:3001/api/tasks/${task.id}/complete`
        : `http://localhost:3001/api/tasks/${task.id}/undo`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to update task');
      
      const updated = await res.json();
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestTasks = async () => {
    try {
      setSuggestingTasks(true);
      const token = getToken();
      const res = await fetch('http://localhost:3001/api/tasks/suggest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch AI suggestions');
      const data = await res.json();
      setAiSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestingTasks(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in relative z-10">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00f0ff] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse pointer-events-none -z-10" />

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white light:text-slate-800 tracking-tight uppercase">Action Items</h1>
          <p className="text-[#b9cacb] light:text-slate-500 mt-1 font-mono text-[11px] uppercase tracking-wider">Manage your daily sales tasks and AI-generated follow-ups.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSuggestTasks}
            disabled={suggestingTasks}
            className="btn-secondary flex items-center gap-2 border-[#bd00ff]/30 text-[#bd00ff] hover:bg-[#bd00ff]/10"
          >
            {suggestingTasks ? <MoreHorizontal className="animate-pulse" size={14} /> : <Sparkles size={14} />}
            AI Suggest
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={14} />
            {showAddForm ? 'Cancel' : 'New Task'}
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm font-medium border border-red-100 dark:border-red-500/20">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div className="glass-panel p-5 mb-6 border border-[#bd00ff]/30 animate-fade-in">
          <h3 className="text-[#bd00ff] font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={14} />
            AI Suggested Tasks
          </h3>
          <div className="space-y-2">
            {aiSuggestions.map((sug, i) => (
              <div key={i} className="flex items-center justify-between bg-[#111114] p-3 rounded-lg border border-[#27272A]">
                <div>
                  <p className="text-sm text-white font-medium">{sug.title}</p>
                  <span className={`text-[10px] uppercase font-bold ${sug.priority === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{sug.priority}</span>
                </div>
                <button 
                  onClick={() => {
                    setNewTaskTitle(sug.title);
                    setNewTaskPriority(sug.priority);
                    setShowAddForm(true);
                    setAiSuggestions(aiSuggestions.filter((_, idx) => idx !== i));
                  }}
                  className="btn-secondary h-8 px-3 text-[10px]"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setAiSuggestions([])} className="mt-3 text-[#b9cacb] text-xs hover:text-white">Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateTask} className="glass-panel p-5 mb-6 animate-fade-in border border-[#00f0ff]/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              autoFocus
              type="text" 
              placeholder="E.g., Call CEO of Globus Logistics to discuss proposal..." 
              className="input-field flex-1"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />
            <select 
              className="input-field w-full sm:w-32"
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="btn-primary whitespace-nowrap">Save Task</button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {/* Pending Tasks */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00f0ff] light:text-blue-600 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
            Pending Action Items ({pendingTasks.length})
          </h3>
          <div className="space-y-2">
            {pendingTasks.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No pending tasks! You are all caught up.
              </div>
            )}
            {pendingTasks.map(task => (
              <div key={task.id} className="group glass-card p-4 flex items-center gap-4 bg-[#16161D] light:bg-white/60 hover:border-[#00f0ff]/50 transition-colors">
                <button 
                  onClick={() => handleToggleComplete(task)}
                  className="text-[#27272A] hover:text-[#00f0ff] light:text-blue-600 drop-shadow-[0_0_8px_rgba(0,240,255,0)] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all shrink-0"
                  title="Mark Complete"
                >
                  <Circle size={24} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#e5e1e4] light:text-slate-700 leading-tight truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {task.priority === 'high' && <span className="badge bg-[#ff007a]/10 text-[#ff007a] border border-[#ff007a]/30">High Priority</span>}
                    {task.priority === 'low' && <span className="badge bg-[#b9cacb]/10 text-[#b9cacb] light:text-slate-500 border border-[#b9cacb]/30">Low Priority</span>}
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#b9cacb] light:text-slate-500">
                        <Clock size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#b9cacb] light:text-slate-500 hover:text-[#ff007a] hover:bg-[#ff007a]/10 rounded-xl transition-all"
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#b9cacb] light:text-slate-500 mb-3">
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-2 opacity-50">
              {completedTasks.map(task => (
                <div key={task.id} className="group glass-card p-4 flex items-center gap-4 bg-transparent border-[#27272A] light:border-slate-200">
                  <div className="text-[#00f0ff] light:text-blue-600 shrink-0 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#b9cacb] light:text-slate-500 line-through leading-tight truncate">
                      {task.title}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#00f0ff] light:text-blue-600 hover:bg-[#00f0ff]/10 light:bg-blue-50 rounded-xl transition-all"
                  >
                    <Undo2 size={12} />
                    Undo
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-all"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
