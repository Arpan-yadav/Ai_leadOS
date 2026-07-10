import { Handle, Position, useReactFlow } from 'reactflow';
import { Play, Zap, Sparkles, Trash2 } from 'lucide-react';

export function TriggerNode({ id, data }: { id: string, data: any }) {
  const { setNodes, setEdges } = useReactFlow();
  
  const onDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="w-64 rounded-xl border-2 border-emerald-500/50 bg-[#0A0A0C]/90 light:bg-emerald-50 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden group">
      <div className="bg-emerald-500/20 light:bg-emerald-100 p-3 flex items-center justify-between border-b border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-emerald-400 light:text-emerald-600" />
          <span className="font-bold text-emerald-400 light:text-emerald-700 text-xs uppercase tracking-wider">Trigger</span>
        </div>
        <button onClick={onDelete} className="text-emerald-500/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-4">
        <div className="font-semibold text-white light:text-slate-800 text-sm mb-1">{data.label || 'New Lead Created'}</div>
        <div className="text-xs text-[#b9cacb] light:text-slate-500">{data.description || 'When a lead enters the CRM'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-400 border-2 border-[#0A0A0C]" />
    </div>
  );
}

export function ActionNode({ id, data }: { id: string, data: any }) {
  const { setNodes, setEdges } = useReactFlow();
  
  const onDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="w-64 rounded-xl border-2 border-[#00f0ff]/50 bg-[#0A0A0C]/90 light:bg-indigo-50 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#00f0ff] border-2 border-[#0A0A0C]" />
      <div className="bg-[#00f0ff]/20 light:bg-indigo-100 p-3 flex items-center justify-between border-b border-[#00f0ff]/30">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#00f0ff] light:text-indigo-600" />
          <span className="font-bold text-[#00f0ff] light:text-indigo-700 text-xs uppercase tracking-wider">Action</span>
        </div>
        <button onClick={onDelete} className="text-[#00f0ff]/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-4">
        <div className="font-semibold text-white light:text-slate-800 text-sm mb-1">{data.label || 'Send Email'}</div>
        <div className="text-xs text-[#b9cacb] light:text-slate-500">{data.description || 'Send welcome template'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#00f0ff] border-2 border-[#0A0A0C]" />
    </div>
  );
}

export function AIDecisionNode({ id, data }: { id: string, data: any }) {
  const { setNodes, setEdges } = useReactFlow();
  
  const onDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="w-64 rounded-xl border-2 border-[#bd00ff]/50 bg-[#0A0A0C]/90 light:bg-purple-50 backdrop-blur-md shadow-[0_0_20px_rgba(189,0,255,0.3)] overflow-hidden group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#bd00ff] border-2 border-[#0A0A0C]" />
      <div className="bg-[#bd00ff]/20 light:bg-purple-100 p-3 flex items-center justify-between border-b border-[#bd00ff]/30">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#bd00ff] light:text-purple-600" />
          <span className="font-bold text-[#bd00ff] light:text-purple-700 text-xs uppercase tracking-wider">AI Decision</span>
        </div>
        <button onClick={onDelete} className="text-[#bd00ff]/50 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="p-4">
        <div className="font-semibold text-white light:text-slate-800 text-sm mb-1">{data.label || 'Check AI Score'}</div>
        <div className="text-xs text-[#b9cacb] light:text-slate-500">{data.description || 'If score > 80, route to High Intent'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} className="w-3 h-3 bg-emerald-400 border-2 border-[#0A0A0C]" />
      <div className="absolute bottom-[-20px] left-[25%] -translate-x-1/2 text-[9px] text-emerald-400 font-bold">YES</div>
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} className="w-3 h-3 bg-rose-400 border-2 border-[#0A0A0C]" />
      <div className="absolute bottom-[-20px] left-[75%] -translate-x-1/2 text-[9px] text-rose-400 font-bold">NO</div>
    </div>
  );
}
