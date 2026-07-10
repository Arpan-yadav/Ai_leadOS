import React, { useCallback, useState } from 'react';
import { X, Settings2 } from 'lucide-react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TriggerNode, ActionNode, AIDecisionNode } from './CustomNodes';

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  aiDecisionNode: AIDecisionNode,
};

const initialNodes = [
  {
    id: 'trigger-1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: { label: 'New Lead Created', description: 'When a new lead enters the CRM' },
  },
  {
    id: 'ai-1',
    type: 'aiDecisionNode',
    position: { x: 250, y: 200 },
    data: { label: 'Check AI Score', description: 'If score > 80, route to High Intent' },
  },
  {
    id: 'action-1',
    type: 'actionNode',
    position: { x: 50, y: 350 },
    data: { label: 'Send High-Intent Email', description: 'Personalized intro' },
  },
  {
    id: 'action-2',
    type: 'actionNode',
    position: { x: 450, y: 350 },
    data: { label: 'Add to Nurture Sequence', description: 'Standard drip campaign' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'trigger-1', target: 'ai-1', animated: true, style: { stroke: '#00f0ff', strokeWidth: 2 } },
  { id: 'e2-3', source: 'ai-1', target: 'action-1', sourceHandle: 'true', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
  { id: 'e2-4', source: 'ai-1', target: 'action-2', sourceHandle: 'false', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
];

export default function WorkflowBuilder({ 
  theme,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  setEdges
}: { 
  theme: 'dark' | 'light',
  nodes: any[],
  edges: any[],
  onNodesChange: any,
  onEdgesChange: any,
  setEdges: any
}) {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  }, []);

  const closePanel = () => setSelectedNode(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds: Edge[]) => addEdge({ ...params, animated: true, style: { stroke: '#00f0ff', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');
      const desc = event.dataTransfer.getData('application/desc');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // We need to calculate the actual position on the canvas. 
      // For simplicity in this non-ref-based implementation, we place it near the center or an offset.
      // In a real implementation with reactflowInstance, we'd project the coordinates.
      const position = {
        x: event.clientX - 350, // rough offset
        y: event.clientY - 150, // rough offset
      };

      const newNode = {
        id: `dndnode_${new Date().getTime()}`,
        type,
        position,
        data: { label, description: desc },
      };

      onNodesChange([{ item: newNode, type: 'add' }]);
    },
    [onNodesChange]
  );

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#0A0A0C] light:bg-slate-50"
        >
          <Background color={theme === 'dark' ? '#27272A' : '#e2e8f0'} gap={20} size={1} />
          <Controls className="bg-white/10 border-white/20 backdrop-blur-md fill-white" />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'triggerNode') return '#10b981';
              if (node.type === 'actionNode') return '#00f0ff';
              if (node.type === 'aiDecisionNode') return '#bd00ff';
              return '#27272A';
            }}
            maskColor={theme === 'dark' ? 'rgba(10, 10, 12, 0.7)' : 'rgba(248, 250, 252, 0.7)'}
            style={{ backgroundColor: theme === 'dark' ? '#111114' : '#ffffff' }}
          />
        </ReactFlow>
        
        {/* Node Config Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 glass-panel border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden animate-slide-left z-50">
            <div className="p-4 bg-black/40 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-[#00f0ff]" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">Node Config</h3>
              </div>
              <button onClick={closePanel} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Node Label</label>
                <input 
                  type="text" 
                  value={selectedNode.data?.label || ''} 
                  readOnly
                  className="input-field w-full text-sm bg-black/20"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Description</label>
                <textarea 
                  value={selectedNode.data?.description || ''} 
                  readOnly
                  className="input-field w-full text-sm bg-black/20 h-20 resize-none"
                />
              </div>
              {selectedNode.type === 'actionNode' && (
                <div>
                  <label className="block text-[10px] text-[#00f0ff] uppercase tracking-widest mb-1 font-bold">Email Template</label>
                  <select className="input-field w-full text-sm border-[#00f0ff]/30 text-white focus:border-[#00f0ff]">
                    <option>High-Intent Welcome</option>
                    <option>Nurture Drip 1</option>
                    <option>Post-Webinar Follow-up</option>
                  </select>
                </div>
              )}
              {selectedNode.type === 'aiDecisionNode' && (
                <div>
                  <label className="block text-[10px] text-[#bd00ff] uppercase tracking-widest mb-1 font-bold">Score Threshold</label>
                  <input type="number" defaultValue={80} className="input-field w-full text-sm border-[#bd00ff]/30 text-white" />
                </div>
              )}
              <div className="pt-4 border-t border-white/10">
                <button onClick={closePanel} className="btn-primary w-full shadow-[0_0_15px_rgba(0,240,255,0.3)]">Save Configuration</button>
              </div>
            </div>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
}

export { initialNodes, initialEdges };
