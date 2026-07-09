import React, { useCallback, useState } from 'react';
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
      </ReactFlowProvider>
    </div>
  );
}

export { initialNodes, initialEdges };
