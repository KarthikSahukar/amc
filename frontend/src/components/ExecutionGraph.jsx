import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Save,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Loader2
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: {
    border: 'border-slate-700/60',
    bg: 'bg-slate-900/60',
    text: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    glow: '',
    pulse: false,
    icon: <Clock className="w-3.5 h-3.5" />
  },
  READY: {
    border: 'border-sky-500/50',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    badge: 'bg-sky-900/60 text-sky-300 border-sky-600',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.2)]',
    pulse: true,
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />
  },
  RUNNING: {
    border: 'border-cyan-400',
    bg: 'bg-cyan-950/50',
    text: 'text-cyan-200',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    pulse: true,
    icon: <RotateCw className="w-3.5 h-3.5 animate-spin" />
  },
  SUCCESS: {
    border: 'border-emerald-500/80',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-200',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    pulse: false,
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
  },
  FAILED: {
    border: 'border-rose-500',
    bg: 'bg-rose-950/60',
    text: 'text-rose-200',
    badge: 'bg-rose-500/30 text-rose-300 border-rose-500 animate-bounce',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.5)]',
    pulse: true,
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
  },
  RETRYING: {
    border: 'border-amber-400',
    bg: 'bg-amber-950/60',
    text: 'text-amber-200',
    badge: 'bg-amber-500/30 text-amber-300 border-amber-400 animate-spin',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    pulse: true,
    icon: <RotateCw className="w-3.5 h-3.5 text-amber-400" />
  },
  WAITING_APPROVAL: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-950/60',
    text: 'text-yellow-200',
    badge: 'bg-yellow-500/30 text-yellow-300 border-yellow-400 animate-pulse',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.5)]',
    pulse: true,
    icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
  },
  SKIPPED: {
    border: 'border-slate-800',
    bg: 'bg-slate-950/40',
    text: 'text-slate-500',
    badge: 'bg-slate-900 text-slate-500 border-slate-800',
    glow: '',
    pulse: false,
    icon: <Clock className="w-3.5 h-3.5" />
  }
};

const TASK_ICONS = {
  search: Search,
  resume: FileText,
  deadlines: Clock,
  details: Layers,
  match: Sparkles,
  save: Save,
  email: Mail,
  verify: ShieldCheck
};

// Custom Node Component
export function MissionTaskNode({ data }) {
  const status = data.status || 'PENDING';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const IconComponent = TASK_ICONS[data.id] || Layers;

  return (
    <div
      className={`relative w-64 rounded-xl border-2 transition-all duration-300 p-3.5 glass-panel ${cfg.border} ${cfg.bg} ${cfg.glow}`}
    >
      {/* Target handle for incoming edges */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900 transition-colors"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              status === 'SUCCESS'
                ? 'bg-emerald-500/20 text-emerald-300'
                : status === 'RUNNING'
                ? 'bg-cyan-500/20 text-cyan-300'
                : status === 'FAILED'
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              {data.id}
            </div>
            {data.category && (
              <span className="text-[10px] font-medium text-slate-400">
                {data.category}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}
        >
          {cfg.icon}
          <span>{status}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
        {data.description}
      </p>

      {/* Footer: Tool name & timing */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1 truncate max-w-[140px]">
          <span className="text-slate-500">tool:</span>
          <span className="text-cyan-400 truncate">
            {data.tool ? `${data.tool}()` : 'internal'}
          </span>
        </div>
        {data.duration_ms ? (
          <span className="text-emerald-400 font-medium">{data.duration_ms}ms</span>
        ) : (
          <span className="text-slate-500">--</span>
        )}
      </div>

      {/* Retrying / Error indicator */}
      {data.retry_count > 0 && (
        <div className="mt-1.5 text-[10px] text-amber-300 flex items-center gap-1 font-mono">
          <RotateCw className="w-3 h-3 animate-spin" />
          <span>Recovered (Retry #{data.retry_count})</span>
        </div>
      )}

      {/* Source handle for outgoing edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-900 transition-colors"
      />
    </div>
  );
}

const nodeTypes = {
  taskNode: MissionTaskNode
};

export default function ExecutionGraph({ tasks = [] }) {
  // Compute node positions for canonical DAG layout
  const { nodes, edges } = useMemo(() => {
    // Canonical node coordinates (x, y) matching the DAG layers
    const positions = {
      // Layer 1 (Independent Parallel Roots)
      search: { x: 50, y: 30 },
      resume: { x: 340, y: 30 },
      deadlines: { x: 630, y: 30 },

      // Layer 2 (Join Node)
      match: { x: 340, y: 220 },

      // Layer 3 (Parallel Branches: Mutation + Human Approval Gate)
      save: { x: 190, y: 410 },
      email: { x: 490, y: 410 },

      // Layer 4 (Final Verification Audit)
      verify: { x: 340, y: 590 }
    };

    const taskLookup = {};
    tasks.forEach((t) => {
      taskLookup[t.id] = t;
    });

    const flowNodes = Object.entries(positions).map(([id, pos]) => {
      const taskData = taskLookup[id] || {
        id,
        description: id.toUpperCase(),
        tool: id,
        status: 'PENDING'
      };

      return {
        id,
        type: 'taskNode',
        position: pos,
        data: taskData
      };
    });

    // Define canonical edges matching the dependency DAG
    const edgeDefinitions = [
      { id: 'e-search-match', source: 'search', target: 'match' },
      { id: 'e-resume-match', source: 'resume', target: 'match' },
      { id: 'e-deadlines-match', source: 'deadlines', target: 'match' },
      { id: 'e-match-save', source: 'match', target: 'save' },
      { id: 'e-match-email', source: 'match', target: 'email' },
      { id: 'e-save-verify', source: 'save', target: 'verify' },
      { id: 'e-email-verify', source: 'email', target: 'verify' }
    ];

    const flowEdges = edgeDefinitions.map((edge) => {
      const sourceTask = taskLookup[edge.source];
      const targetTask = taskLookup[edge.target];
      const isSourceSuccess = sourceTask?.status === 'SUCCESS';
      const isTargetActive =
        targetTask?.status === 'RUNNING' || targetTask?.status === 'READY';

      return {
        ...edge,
        animated: isTargetActive || (isSourceSuccess && targetTask?.status === 'PENDING'),
        style: {
          stroke: isSourceSuccess ? '#10b981' : isTargetActive ? '#06b6d4' : '#334155',
          strokeWidth: isTargetActive ? 2.5 : 2
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceSuccess ? '#10b981' : isTargetActive ? '#06b6d4' : '#334155'
        }
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [tasks]);

  return (
    <div className="w-full h-full min-h-[500px] relative rounded-2xl overflow-hidden border border-white/10 glass-panel flex flex-col" style={{ width: '100%', height: '100%' }}>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="text-slate-300 font-semibold tracking-wide">
          LIVE EXECUTION GRAPH (DAG)
        </span>
      </div>

      <div className="w-full h-full flex-1" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!border-white/10" />
        </ReactFlow>
      </div>
    </div>
  );
}
