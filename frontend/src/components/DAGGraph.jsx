import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search, FileText, Clock, Sparkles, Save,
  Mail, ShieldCheck, CheckCircle2, AlertTriangle,
  RotateCw, Loader2, Zap,
} from 'lucide-react';

/* ─── DAG layout config ─────────────────────────────────────────── */
const POSITIONS = {
  search:    { x: 40,  y: 20  },
  resume:    { x: 310, y: 20  },
  deadlines: { x: 580, y: 20  },
  match:     { x: 310, y: 200 },
  save:      { x: 160, y: 380 },
  email:     { x: 460, y: 380 },
  verify:    { x: 310, y: 560 },
};

const EDGE_DEFINITIONS = [
  { id: 'e-s-m',  source: 'search',    target: 'match'  },
  { id: 'e-r-m',  source: 'resume',    target: 'match'  },
  { id: 'e-d-m',  source: 'deadlines', target: 'match'  },
  { id: 'e-m-sv', source: 'match',     target: 'save'   },
  { id: 'e-m-em', source: 'match',     target: 'email'  },
  { id: 'e-sv-v', source: 'save',      target: 'verify' },
  { id: 'e-em-v', source: 'email',     target: 'verify' },
];

// Progressive reveal order: list of [nodeId, edgeIds[]] to reveal at each step
const REVEAL_SEQUENCE = [
  { delay: 0,    nodes: ['search'],    edges: [] },
  { delay: 350,  nodes: ['resume'],    edges: [] },
  { delay: 700,  nodes: ['deadlines'], edges: ['e-s-m', 'e-r-m', 'e-d-m'] },
  { delay: 1200, nodes: ['match'],     edges: [] },
  { delay: 1700, nodes: ['save'],      edges: ['e-m-sv'] },
  { delay: 1900, nodes: ['email'],     edges: ['e-m-em'] },
  { delay: 2400, nodes: ['verify'],   edges: ['e-sv-v', 'e-em-v'] },
];

/* ─── Icons ─────────────────────────────────────────────────────── */
const ICONS = {
  search:    Search,
  resume:    FileText,
  deadlines: Clock,
  match:     Sparkles,
  save:      Save,
  email:     Mail,
  verify:    ShieldCheck,
};

const TASK_LABELS = {
  search:    'SEARCH',
  resume:    'RESUME',
  deadlines: 'DEADLINES',
  match:     'MATCH',
  save:      'SAVE',
  email:     'EMAIL',
  verify:    'VERIFY',
};

const TASK_SUBTITLES = {
  search:    'Research MCP',
  resume:    'Workspace MCP',
  deadlines: 'Research MCP',
  match:     'Reasoning',
  save:      'Workspace MCP',
  email:     'Workspace MCP',
  verify:    'Verification',
};

/* ─── Custom Node ────────────────────────────────────────────────── */
function TaskNode({ data }) {
  const status = (data.status || 'PENDING').toUpperCase();
  const Icon = ICONS[data.taskId] || Sparkles;

  const isRunning  = status === 'RUNNING' || status === 'READY';
  const isSuccess  = status === 'SUCCESS';
  const isFailed   = status === 'FAILED';
  const isRetrying = status === 'RETRYING';
  const isWaiting  = status === 'WAITING_APPROVAL';
  const isDedupe   = data.deduplicated;

  let borderColor = '#3f4759';
  let bgColor     = 'rgba(63,71,89,0.22)';
  let textColor   = '#6b7a95';
  let glowColor   = 'none';

  if (isRunning) {
    borderColor = '#4f8ef7';
    bgColor     = 'rgba(79,142,247,0.10)';
    textColor   = '#93bbff';
    glowColor   = '0 0 20px rgba(79,142,247,0.28)';
  } else if (isSuccess) {
    borderColor = '#22c55e';
    bgColor     = 'rgba(34,197,94,0.09)';
    textColor   = '#4ade80';
    glowColor   = '0 0 14px rgba(34,197,94,0.22)';
  } else if (isFailed) {
    borderColor = '#f43f5e';
    bgColor     = 'rgba(244,63,94,0.12)';
    textColor   = '#fb7185';
    glowColor   = '0 0 20px rgba(244,63,94,0.3)';
  } else if (isRetrying) {
    borderColor = '#f59e0b';
    bgColor     = 'rgba(245,158,11,0.10)';
    textColor   = '#fbbf24';
    glowColor   = '0 0 16px rgba(245,158,11,0.25)';
  } else if (isWaiting) {
    borderColor = '#f59e0b';
    bgColor     = 'rgba(245,158,11,0.10)';
    textColor   = '#fbbf24';
    glowColor   = '0 0 20px rgba(245,158,11,0.3)';
  }

  return (
    <div
      onClick={() => data.onNodeClick && data.onNodeClick(data)}
      style={{
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        borderRadius: '14px',
        padding: '12px 14px',
        width: '170px',
        cursor: 'pointer',
        boxShadow: glowColor,
        transition: 'box-shadow 0.3s, border-color 0.3s, background 0.3s',
        position: 'relative',
        userSelect: 'none',
        animation: 'node-appear 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}
    >
      {/* Pulsing ring for running state */}
      {isRunning && (
        <div
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '18px',
            border: `2px solid ${borderColor}`,
            animation: 'pulse-ring 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <Handle type="target" position={Position.Top} style={{ background: borderColor, border: 'none', width: 8, height: 8 }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 28, height: 28,
              borderRadius: '8px',
              background: `${borderColor}22`,
              border: `1px solid ${borderColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: textColor,
            }}
          >
            {isRetrying ? (
              <RotateCw style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
            ) : isRunning ? (
              <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
            ) : isSuccess ? (
              <CheckCircle2 style={{ width: 13, height: 13 }} />
            ) : isFailed ? (
              <AlertTriangle style={{ width: 13, height: 13 }} />
            ) : (
              <Icon style={{ width: 13, height: 13 }} />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                color: textColor,
                letterSpacing: '0.05em',
              }}
            >
              {TASK_LABELS[data.taskId] || data.taskId?.toUpperCase()}
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '1px' }}>
              {TASK_SUBTITLES[data.taskId] || ''}
            </div>
          </div>
        </div>

        {/* Status dot */}
        <div
          style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: borderColor,
            boxShadow: `0 0 6px ${borderColor}`,
            animation: (isRunning || isRetrying) ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* Duration / status line */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
        }}
      >
        {isDedupe && (
          <span style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(167,139,250,0.15)',
            color: '#c4b5fd',
            border: '1px solid rgba(167,139,250,0.35)',
            borderRadius: '4px',
            padding: '1px 6px',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <Zap style={{ width: 8, height: 8 }} /> DEDUP
          </span>
        )}

        {data.duration_ms ? (
          <span style={{
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: isSuccess ? '#22c55e' : '#4a5568',
            marginLeft: 'auto',
          }}>
            {(data.duration_ms / 1000).toFixed(2)}s
          </span>
        ) : (
          <span style={{ fontSize: '10px', color: '#333845', marginLeft: 'auto', fontFamily: 'monospace' }}>—</span>
        )}
      </div>

      {/* Retry badge */}
      {data.retry_count > 0 && (
        <div style={{
          marginTop: '5px',
          fontSize: '9px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f59e0b',
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          <RotateCw style={{ width: 9, height: 9 }} />
          Recovered (attempt #{data.retry_count})
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: borderColor, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { taskNode: TaskNode };

/* ─── Inner flow component (needs ReactFlow context) ────────────── */
function DAGFlow({ tasks, revealedNodes, revealedEdges, onNodeClick }) {
  const taskMap = useMemo(() => {
    const m = {};
    tasks.forEach(t => { m[t.id] = t; });
    return m;
  }, [tasks]);

  const nodes = useMemo(() =>
    revealedNodes
      .filter(id => POSITIONS[id])
      .map(id => {
        const task = taskMap[id] || { id, status: 'PENDING' };
        return {
          id,
          type: 'taskNode',
          position: POSITIONS[id],
          data: {
            taskId: id,
            status: task.status,
            duration_ms: task.duration_ms,
            retry_count: task.retry_count,
            deduplicated: task.deduplicated,
            description: task.description,
            tool: task.tool,
            category: task.category,
            onNodeClick,
          },
        };
      }),
    [revealedNodes, taskMap, onNodeClick]
  );

  const edges = useMemo(() => {
    return EDGE_DEFINITIONS.filter(e => revealedEdges.includes(e.id)).map(e => {
      const src = taskMap[e.source];
      const tgt = taskMap[e.target];
      const srcDone = src?.status === 'SUCCESS' || src?.status === 'SKIPPED';
      const tgtActive = tgt?.status === 'RUNNING' || tgt?.status === 'READY';

      const color = srcDone ? '#22c55e' : tgtActive ? '#4f8ef7' : '#2d3748';

      return {
        ...e,
        animated: tgtActive || (srcDone && (!tgt || tgt.status === 'PENDING')),
        style: { stroke: color, strokeWidth: tgtActive ? 2 : 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 16, height: 16,
        },
      };
    });
  }, [revealedEdges, taskMap]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.4}
      maxZoom={1.8}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      style={{ width: '100%', height: '100%' }}
    >
      <Background
        color="#1a2030"
        gap={24}
        size={1}
        style={{ opacity: 0.6 }}
      />
    </ReactFlow>
  );
}

/* ─── Main exported component ────────────────────────────────────── */
export default function DAGGraph({ tasks = [], revealed = false, onNodeClick }) {
  const [revealedNodes, setRevealedNodes] = useState([]);
  const [revealedEdges, setRevealedEdges] = useState([]);
  const [fullyRevealed, setFullyRevealed] = useState(false);

  // Progressive reveal when `revealed` becomes true
  useEffect(() => {
    if (!revealed) {
      setRevealedNodes([]);
      setRevealedEdges([]);
      setFullyRevealed(false);
      return;
    }

    const timers = REVEAL_SEQUENCE.map((step) =>
      setTimeout(() => {
        setRevealedNodes(prev => [...new Set([...prev, ...step.nodes])]);
        setRevealedEdges(prev => [...new Set([...prev, ...step.edges])]);
      }, step.delay)
    );

    const doneTimer = setTimeout(() => setFullyRevealed(true), 3000);
    timers.push(doneTimer);

    return () => timers.forEach(clearTimeout);
  }, [revealed]);

  // When tasks change from backend and already revealed, ensure all nodes/edges are shown
  useEffect(() => {
    if (fullyRevealed) {
      const allNodes = Object.keys(POSITIONS);
      const allEdges = EDGE_DEFINITIONS.map(e => e.id);
      setRevealedNodes(allNodes);
      setRevealedEdges(allEdges);
    }
  }, [fullyRevealed]);

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <DAGFlow
          tasks={tasks}
          revealedNodes={revealedNodes}
          revealedEdges={revealedEdges}
          onNodeClick={onNodeClick}
        />
      </div>
    </ReactFlowProvider>
  );
}
