import React, { useState } from 'react';
import { Cpu, Activity, ChevronRight, RotateCcw, CheckCircle2, Clock, AlertTriangle, Loader2, Zap } from 'lucide-react';
import DAGGraph from './DAGGraph';
import ActivityDrawer from './ActivityDrawer';
import NodeDetailPanel from './NodeDetailPanel';

/* ── Status label helpers ── */
function StatusPill({ status, isRunning }) {
  const cfg = {
    IDLE:             { label: 'STANDBY',        color: '#4a5568',  dot: '#4a5568' },
    PLANNING:         { label: 'PLANNING',        color: '#4f8ef7',  dot: '#4f8ef7' },
    EXECUTING:        { label: 'EXECUTING',       color: '#4f8ef7',  dot: '#4f8ef7' },
    WAITING_APPROVAL: { label: 'AWAITING APPROVAL', color: '#f59e0b', dot: '#f59e0b' },
    VERIFYING:        { label: 'VERIFYING',       color: '#22c55e',  dot: '#22c55e' },
    COMPLETED:        { label: 'COMPLETE',         color: '#22c55e',  dot: '#22c55e' },
    FAILED:           { label: 'FAILED',          color: '#f43f5e',  dot: '#f43f5e' },
  }[status] || { label: status, color: '#4a5568', dot: '#4a5568' };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        background: `${cfg.dot}12`,
        border: `1px solid ${cfg.dot}30`,
        borderRadius: '8px',
        padding: '5px 12px',
      }}
    >
      <span
        style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
          boxShadow: `0 0 6px ${cfg.dot}`,
          animation: isRunning ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
      <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.07em', color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

/* ── Metrics strip ── */
function MetricsStrip({ metrics, tasks }) {
  const running = tasks.filter(t => t.status === 'RUNNING').length;

  const items = [
    {
      icon: <CheckCircle2 style={{ width: 13, height: 13 }} />,
      label: `${metrics?.completed_tasks || 0}/${metrics?.total_tasks || 7} tasks`,
      color: '#22c55e',
    },
    ...(running > 0 ? [{
      icon: <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />,
      label: `${running} running in parallel`,
      color: '#4f8ef7',
    }] : []),
    ...(metrics?.tool_calls_deduplicated > 0 ? [{
      icon: <Zap style={{ width: 13, height: 13 }} />,
      label: `${metrics.tool_calls_deduplicated} deduplicated`,
      color: '#c4b5fd',
    }] : []),
    ...(metrics?.recovered_failures > 0 ? [{
      icon: <RotateCcw style={{ width: 13, height: 13 }} />,
      label: `${metrics.recovered_failures} recovered`,
      color: '#f59e0b',
    }] : []),
    ...(metrics?.elapsed_time_seconds > 0 ? [{
      icon: <Clock style={{ width: 13, height: 13 }} />,
      label: `${metrics.elapsed_time_seconds}s elapsed`,
      color: 'var(--text-secondary)',
    }] : []),
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            color: item.color,
            padding: '4px 9px',
            background: `${item.color}10`,
            border: `1px solid ${item.color}25`,
            borderRadius: '6px',
          }}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ progress }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          flex: 1,
          height: '3px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: '2px',
            background: 'linear-gradient(90deg, #4f8ef7, #22c55e)',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#4f8ef7', minWidth: '32px', textAlign: 'right' }}>
        {progress}%
      </span>
    </div>
  );
}

/* ── Main Execution View ── */
export default function ExecutionView({
  status,
  progress,
  tasks,
  events,
  metrics,
  goal,
  missionId,
  dagRevealed,
  onGoToDone,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const isRunning = ['PLANNING', 'EXECUTING', 'VERIFYING'].includes(status);
  const isWaiting = status === 'WAITING_APPROVAL';

  const handleNodeClick = (nodeData) => {
    setSelectedNode(prev => (prev?.taskId === nodeData.taskId ? null : nodeData));
  };

  return (
    <div
      className="ambient-bg"
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fade-in 0.5s ease both',
      }}
    >
      {/* ── Top Header Bar ── */}
      <header
        className="glass"
        style={{
          height: 56,
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(79,142,247,0.3)',
            }}
          >
            <Cpu style={{ width: 14, height: 14, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>OperatorOS</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />

        {/* Mission goal */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>Mission:</span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {goal}
          </span>
        </div>

        {/* Status pill */}
        <StatusPill status={status} isRunning={isRunning} />

        {/* Activity button */}
        <button
          onClick={() => setDrawerOpen(v => !v)}
          style={{
            background: drawerOpen ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${drawerOpen ? 'rgba(79,142,247,0.3)' : 'var(--border-subtle)'}`,
            borderRadius: '8px',
            padding: '6px 12px',
            color: drawerOpen ? '#93bbff' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s',
          }}
        >
          <Activity style={{ width: 14, height: 14 }} />
          Activity
          {events.length > 0 && (
            <span
              style={{
                background: '#4f8ef7',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
              }}
            >
              {events.length}
            </span>
          )}
        </button>
      </header>

      {/* ── Progress strip ── */}
      <div
        style={{
          padding: '10px 20px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}
      >
        <ProgressBar progress={progress} />
        <MetricsStrip metrics={metrics} tasks={tasks} />
      </div>

      {/* ── Main content: DAG fills the center ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* DAG header label */}
        <div
          style={{
            position: 'absolute',
            top: 16, left: 16,
            zIndex: 10,
            background: 'rgba(8,9,13,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: isRunning ? '#4f8ef7' : status === 'COMPLETED' ? '#22c55e' : '#4a5568',
              display: 'inline-block',
              animation: isRunning ? 'glow-pulse 1.5s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
            EXECUTION DAG
          </span>
        </div>

        {/* Hint: click nodes */}
        {dagRevealed && !selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: 16, right: 16,
              zIndex: 10,
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              background: 'rgba(8,9,13,0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '5px 10px',
            }}
          >
            Click any node to inspect →
          </div>
        )}

        <DAGGraph
          tasks={tasks}
          revealed={dagRevealed}
          onNodeClick={handleNodeClick}
        />

        {/* Node detail panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Activity Drawer */}
      <ActivityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        events={events}
      />
    </div>
  );
}
