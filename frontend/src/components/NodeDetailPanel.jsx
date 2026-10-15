import React from 'react';
import { X, CheckCircle2, AlertTriangle, RotateCw, Clock, Zap } from 'lucide-react';

const MCP_SERVER = {
  search:    'Research MCP',
  resume:    'Workspace MCP',
  deadlines: 'Research MCP',
  match:     'Internal Reasoning',
  save:      'Workspace MCP',
  email:     'Workspace MCP',
  verify:    'Verification Engine',
};

const MCP_TOOL = {
  search:    'search_jobs()',
  resume:    'read_resume()',
  deadlines: 'search_jobs()',
  match:     'internal_ranking()',
  save:      'save_application_tracker()',
  email:     'create_email_draft()',
  verify:    'audit_results()',
};

const PARALLEL_WAVE = {
  search:    'Wave #1',
  resume:    'Wave #1',
  deadlines: 'Wave #1',
  match:     'Wave #2',
  save:      'Wave #3',
  email:     'Wave #3',
  verify:    'Wave #4',
};

const TASK_DESCRIPTIONS = {
  search:    'Search for AI/ML internship opportunities matching candidate profile',
  resume:    'Extract candidate skills, experience and preferences from resume',
  deadlines: 'Verify application deadlines — deduplicates search_jobs() call',
  match:     'Score and rank all found opportunities against candidate profile',
  save:      'Persist top 3 ranked opportunities to the Application Tracker',
  email:     'Generate personalized outreach emails for top 3 opportunities',
  verify:    'Audit all generated outputs against mission specifications',
};

function StatusBadge({ status }) {
  const s = (status || 'PENDING').toUpperCase();
  const map = {
    PENDING:  { label: 'Pending',  bg: 'rgba(63,71,89,0.3)',       color: '#6b7a95', dot: '#6b7a95' },
    READY:    { label: 'Ready',    bg: 'rgba(79,142,247,0.15)',     color: '#93bbff', dot: '#4f8ef7' },
    RUNNING:  { label: 'Running',  bg: 'rgba(79,142,247,0.15)',     color: '#93bbff', dot: '#4f8ef7' },
    SUCCESS:  { label: 'Success',  bg: 'rgba(34,197,94,0.12)',      color: '#4ade80', dot: '#22c55e' },
    FAILED:   { label: 'Failed',   bg: 'rgba(244,63,94,0.15)',      color: '#fb7185', dot: '#f43f5e' },
    RETRYING: { label: 'Retrying', bg: 'rgba(245,158,11,0.15)',     color: '#fbbf24', dot: '#f59e0b' },
    WAITING_APPROVAL: { label: 'Awaiting Approval', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', dot: '#f59e0b' },
    SKIPPED:  { label: 'Skipped',  bg: 'rgba(63,71,89,0.2)',        color: '#4a5568', dot: '#4a5568' },
  };
  const cfg = map[s] || map.PENDING;

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: cfg.bg,
        border: `1px solid ${cfg.dot}30`,
        borderRadius: '8px',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 600,
        color: cfg.color,
      }}
    >
      <span
        style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: cfg.dot,
          boxShadow: `0 0 6px ${cfg.dot}`,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: 'var(--text-primary)',
          fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
          background: mono ? 'rgba(255,255,255,0.04)' : 'transparent',
          padding: mono ? '5px 8px' : 0,
          borderRadius: mono ? '6px' : 0,
          border: mono ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

export default function NodeDetailPanel({ node, onClose }) {
  if (!node) return null;

  const id = node.taskId || node.id;
  const status = (node.status || 'PENDING').toUpperCase();

  return (
    <div
      className="node-detail-panel glass-elevated"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '300px',
        borderRadius: '16px',
        zIndex: 35,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: '2px' }}>
            TASK DETAIL
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
            {id?.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          <X style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div><StatusBadge status={status} /></div>

        <Row label="Description" value={TASK_DESCRIPTIONS[id] || node.description} />
        <Row label="MCP Server" value={MCP_SERVER[id]} mono />
        <Row label="Tool Call" value={MCP_TOOL[id]} mono />
        <Row label="Execution Wave" value={PARALLEL_WAVE[id]} />

        {node.duration_ms && (
          <Row label="Duration" value={`${(node.duration_ms / 1000).toFixed(2)} seconds`} />
        )}

        {node.retry_count > 0 && (
          <div
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCw style={{ width: 12, height: 12 }} />
            Recovered after {node.retry_count} failure — checkpoint preserved upstream tasks
          </div>
        )}

        {node.deduplicated && (
          <div
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#c4b5fd',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap style={{ width: 12, height: 12 }} />
            Deduplicated — result reused from cache, MCP call skipped
          </div>
        )}
      </div>
    </div>
  );
}
