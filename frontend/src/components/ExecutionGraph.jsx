import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomTaskNode from './CustomTaskNode';

export default function ExecutionGraph({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  selectedNodeId
}) {
  const nodeTypes = useMemo(() => ({ custom: CustomTaskNode }), []);

  // Highlight selected node
  const displayNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId
    }));
  }, [nodes, selectedNodeId]);

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: {
      stroke: '#38bdf8',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#38bdf8',
      width: 14,
      height: 14,
    },
  }), []);

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-hidden select-none">
      {/* Legend / Overlay Header */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg px-3 py-2 text-xs flex items-center gap-3 font-mono shadow-xl">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
          DAG Flow:
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span> Pending
          </span>
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> Running
          </span>
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Success
          </span>
          <span className="flex items-center gap-1 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Failed (Recoverable)
          </span>
          <span className="flex items-center gap-1 text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Approval Gate
          </span>
        </div>
      </div>

      {/* Tip Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/70 border border-slate-800/80 rounded px-2.5 py-1 text-[11px] font-mono text-slate-400">
        💡 Click any node to inspect tool arguments, checkpoint state & outputs
      </div>

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300 [&>button]:!border-slate-800 [&>button]:!bg-slate-900 [&>button:hover]:!bg-slate-800" />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            if (status === 'RUNNING') return '#38bdf8';
            if (status === 'SUCCESS') return '#10b981';
            if (status === 'FAILED') return '#f43f5e';
            if (status === 'WAITING_APPROVAL') return '#eab308';
            return '#334155';
          }}
          maskColor="rgba(8, 12, 20, 0.75)"
          className="!bg-slate-950 !border !border-slate-800 !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
