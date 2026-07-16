'use client';

import { useState, useEffect } from 'react';
import { Bot, Save, Play, Plus, History, Loader2, CheckCircle2 } from 'lucide-react';
import WorkflowBuilder, { initialNodes, initialEdges } from '@/components/automation/WorkflowBuilder';
import { useTheme } from 'next-themes';
import { useNodesState, useEdgesState } from 'reactflow';
import toast from 'react-hot-toast';
import { getToken } from '@/lib/auth';
import ExecutionHistoryModal from '@/components/automation/ExecutionHistoryModal';
import ActivateWorkflowModal from '@/components/automation/ActivateWorkflowModal';
import NodeSidebar from '@/components/automation/NodeSidebar';
import SuggestWorkflowsModal from '@/components/automation/SuggestWorkflowsModal';
import { Sparkles } from 'lucide-react';

export default function AutomationPage({ workflow, currentStep, leadId, onBack }: { workflow?: any; currentStep?: number; leadId?: string; onBack?: () => void }) {
  const { resolvedTheme } = useTheme();
  const [workflowName, setWorkflowName] = useState(workflow?.name || 'New Automated Sequence');
  const [isDirty, setIsDirty] = useState(!workflow?.id); // dirty only if brand new
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.definition?.nodes 
      ? workflow.definition.nodes.map((n: any, i: number) => 
          (currentStep && i === currentStep - 1) 
            ? { ...n, style: { border: '2px solid #00f0ff', boxShadow: '0 0 20px #00f0ff', filter: 'brightness(1.1)', borderRadius: '12px' } } 
            : n
        )
      : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.definition?.edges || initialEdges);
  const [showHistory, setShowHistory] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [mockNewExecution, setMockNewExecution] = useState(false);

  const [enrollment, setEnrollment] = useState<any>(null);
  const [sequence, setSequence] = useState<any>(null);
  const token = getToken();

  useEffect(() => {
    if (leadId && workflowName) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sequences`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()).then(data => {
        const seqs = Array.isArray(data) ? data : data.data || data.sequences || [];
        const matchingSeq = seqs.find((s: any) => s.name === workflowName);
        if (matchingSeq) {
          setSequence(matchingSeq);
          const enr = matchingSeq.enrollments?.find((e: any) => e.leadId === leadId);
          setEnrollment(enr);
        }
      });
    }
  }, [leadId, workflowName, token]);

  useEffect(() => {
    if (enrollment && workflow?.definition?.nodes) {
      setNodes(workflow.definition.nodes.map((n: any, i: number) => 
        (i === enrollment.currentStepNumber - 1) 
          ? { ...n, style: { border: '2px solid #00f0ff', boxShadow: '0 0 20px #00f0ff', filter: 'brightness(1.1)', borderRadius: '12px' } } 
          : n
      ));
    }
  }, [enrollment?.currentStepNumber, workflow?.definition?.nodes]);

  const advanceStep = async (enrollmentId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sequences/enrollments/${enrollmentId}/advance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrollment((prev: any) => ({ ...prev, currentStepNumber: prev.currentStepNumber + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const undoStep = async (enrollmentId: string, targetStep: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/sequences/enrollments/${enrollmentId}/undo/${targetStep}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrollment((prev: any) => ({ ...prev, currentStepNumber: targetStep }));
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        toast.success('Workflow saved successfully!');
        setIsDirty(false);
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

  const applyAISuggestion = (suggestion: any) => {
    setWorkflowName(suggestion.title);
    setShowSuggest(false);
    
    // Convert suggestion to basic flow nodes
    const newNodes: any[] = [];
    const newEdges: any[] = [];
    
    // Trigger
    newNodes.push({
      id: 'node-trigger',
      type: 'triggerNode',
      position: { x: 250, y: 50 },
      data: { label: suggestion.trigger }
    });

    let lastId = 'node-trigger';
    let y = 150;

    // Actions
    suggestion.actions.forEach((action: string, i: number) => {
      const id = `node-action-${i}`;
      newNodes.push({
        id,
        type: 'actionNode',
        position: { x: 250, y },
        data: { label: action }
      });
      
      newEdges.push({
        id: `edge-${lastId}-${id}`,
        source: lastId,
        target: id,
        animated: true,
      });

      lastId = id;
      y += 100;
    });

    setNodes(newNodes);
    setEdges(newEdges);
    toast.success('AI Workflow Applied!');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header Bar */}
      <div className="h-16 border-b border-[#27272A] light:border-slate-200 bg-[#0A0A0C] light:bg-slate-50 flex items-center justify-between px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="mr-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-1 border border-slate-800 rounded-full px-3 py-1.5 bg-black/20 hover:border-[#bd00ff] hover:shadow-[0_0_10px_rgba(189,0,255,0.2)]">
              <- Back to Dashboard
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00f0ff]/20 to-[#bd00ff]/20 border border-[#bd00ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(189,0,255,0.15)]">
            <Bot size={20} className="text-[#0A0A0C]" />
          </div>
          <div>
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-bold text-white light:text-slate-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/50 rounded px-2 -ml-2"
            />
            <div className="flex items-center gap-2 mt-1">
              {isDirty ? (
                <>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                  <span className="text-[11px] text-[#b9cacb] light:text-slate-500">Unsaved changes</span>
                </>
              ) : (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">v Saved</span>
              )}
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
          <button 
            onClick={() => {
              toast.success('Workflow Activated! Simulating real-time execution...');
              setTimeout(() => {
                setMockNewExecution(true);
                setShowHistory(true);
              }, 1500);
            }} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-[#00f0ff] to-[#bd00ff] text-white hover:opacity-90 transition-opacity font-bold text-sm shadow-[0_0_20px_rgba(189,0,255,0.4)]"
          >
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

        {/* Sequence Progress Sidebar */}
        {leadId && enrollment && sequence && (
          <div className="w-80 border-l border-[#27272A] light:border-slate-200 bg-[#0A0A0C] light:bg-slate-50 flex flex-col z-10 shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-[#27272A] light:border-slate-200 sticky top-0 bg-[#0A0A0C] light:bg-slate-50 z-20">
              <h3 className="text-sm font-black uppercase tracking-widest text-white light:text-slate-900">Sequence Progress</h3>
              <p className="text-xs text-slate-400 mt-1">Lead Cadence Checklist</p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {sequence.steps?.map((step: any, index: number) => {
                const stepNum = index + 1;
                const isCompleted = enrollment.currentStepNumber > stepNum;
                const isCurrent = enrollment.currentStepNumber === stepNum;
                return (
                  <div key={index} className={`p-4 rounded-xl border ${isCurrent ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272A] light:border-slate-200 bg-white/5 light:bg-white'} transition-all relative flex flex-col gap-3`}>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 ${isCurrent ? 'text-[#00f0ff]' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                        STEP {stepNum}
                      </span>
                      {isCompleted && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    
                    <div>
                      <div className={`font-bold text-sm ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-100' : 'text-slate-300'}`}>{step.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{step.content || `Wait ${step.waitDays} Days`}</div>
                    </div>

                    {isCurrent && (
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                        {stepNum > 1 && (
                          <button 
                            onClick={() => undoStep(enrollment.id, stepNum - 1)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded bg-white/5 text-slate-300 hover:bg-white/10 transition-colors border border-white/10"
                          >
                            Undo
                          </button>
                        )}
                        <button 
                          onClick={() => advanceStep(enrollment.id)}
                          className="flex-1 py-1.5 text-xs font-bold rounded bg-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/30 transition-colors border border-[#00f0ff]/30"
                        >
                          Mark Done
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showHistory && <ExecutionHistoryModal workflowId={workflow?.id} onClose={() => { setShowHistory(false); setMockNewExecution(false); }} mockNewExecution={mockNewExecution} />}
      {showActivate && <ActivateWorkflowModal onClose={() => setShowActivate(false)} onActivate={() => setShowActivate(false)} />}
      {showSuggest && <SuggestWorkflowsModal onClose={() => setShowSuggest(false)} onApply={applyAISuggestion} />}
    </div>
  );
}
