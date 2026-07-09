'use client';

import { useState } from 'react';
import { Bot, Save, Play, Plus, History, Loader2 } from 'lucide-react';
import WorkflowBuilder, { initialNodes, initialEdges } from '@/components/automation/WorkflowBuilder';
import { useTheme } from 'next-themes';
import { useNodesState, useEdgesState } from 'reactflow';
import toast from 'react-hot-toast';
import { getToken } from '@/lib/auth';
import ExecutionHistoryModal from '@/components/automation/ExecutionHistoryModal';
import ActivateWorkflowModal from '@/components/automation/ActivateWorkflowModal';
import NodeSidebar from '@/components/automation/NodeSidebar';

export default function AutomationPage() {
  const { resolvedTheme } = useTheme();
  const [workflowName, setWorkflowName] = useState('New Automated Sequence');
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showHistory, setShowHistory] = useState(false);
  const [showActivate, setShowActivate] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/workflows`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: workflowName,
          definition: { nodes, edges },
          hasAINodes: nodes.some(n => n.type === 'aiDecisionNode'),
        }),
      });
      if (res.ok) {
        toast.success('Workflow draft saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save workflow draft');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#27272A] light:border-slate-200 bg-[#0A0A0C] light:bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00f0ff] to-[#bd00ff] flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Bot size={20} className="text-[#0A0A0C]" />
          </div>
          <div>
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-bold text-white light:text-slate-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/50 rounded px-2 -ml-2"
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Draft
              </span>
              <span className="text-[11px] text-[#b9cacb] light:text-slate-500">Unsaved changes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#27272A] light:border-slate-200 text-sm text-[#e5e1e4] light:text-slate-700 hover:bg-white/5 light:hover:bg-slate-100 transition-all">
            <History size={16} />
            <span className="hidden sm:inline">Execution History</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 light:bg-slate-200 text-white light:text-slate-800 hover:bg-white/10 light:hover:bg-slate-300 transition-all font-semibold text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Draft
          </button>
          <button onClick={() => setShowActivate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#00f0ff] to-[#bd00ff] text-white hover:opacity-90 transition-opacity font-bold text-sm shadow-[0_0_20px_rgba(189,0,255,0.4)]">
            <Play size={16} className="fill-current" />
            Activate Workflow
          </button>
        </div>
      </div>

      {/* React Flow Canvas Area */}
      <div className="flex-1 relative bg-[#0A0A0C] light:bg-white flex overflow-hidden">
        <NodeSidebar />
        <div className="flex-1 relative">
          <WorkflowBuilder 
            theme={resolvedTheme === 'light' ? 'light' : 'dark'} 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            setEdges={setEdges}
          />
        </div>
      </div>

      {showHistory && <ExecutionHistoryModal onClose={() => setShowHistory(false)} />}
      {showActivate && <ActivateWorkflowModal onClose={() => setShowActivate(false)} onActivate={() => setShowActivate(false)} />}
    </div>
  );
}
