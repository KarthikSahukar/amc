import React, { useEffect, useRef } from 'react';
import { X, ChevronRight, Zap, AlertTriangle, RotateCw, ShieldCheck } from 'lucide-react';

/* Map raw backend events → human-readable messages */
function translateEvent(evt) {
  switch (evt.type) {
    case 'mission_planned':
      return { icon: '🗺️', text: 'Execution plan created', detail: evt.message, color: '#4f8ef7' };

    case 'parallel_batch_started':
      return {
        icon: '⚡',
        text: `Running ${evt.batch_size} tasks in parallel: ${(evt.tasks || []).join(', ')}`,
        detail: null,
        color: '#4f8ef7',
      };

    case 'task_started':
      return {
        icon: '▶',
        text: labelForTask(evt.task_id, 'started'),
        detail: evt.tool ? `${evt.category} MCP → ${evt.tool}()` : null,
        color: '#93bbff',
      };

    case 'task_deduplicated':
      return {
        icon: '⊙',
        text: `Duplicate detected — reusing cached result for ${evt.tool || evt.task_id}`,
        detail: 'Deduplication: avoiding redundant MCP call',
        color: '#c4b5fd',
      };

    case 'task_completed':
      return {
        icon: '✓',
        text: labelForTask(evt.task_id, 'completed'),
        detail: evt.duration_ms ? `${(evt.duration_ms / 1000).toFixed(2)}s` : null,
        color: '#22c55e',
      };

    case 'task_failed':
      return {
        icon: '✕',
        text: labelForTask(evt.task_id, 'failed') + ' — initiating recovery',
        detail: evt.error,
        color: '#f43f5e',
      };

    case 'checkpoint_restored':
      return {
        icon: '↩',
        text: 'Checkpoint restored — previous tasks preserved',
        detail: evt.message,
        color: '#f59e0b',
      };

    case 'task_retry':
      return {
        icon: '↻',
        text: `Retrying ${evt.task_id || 'task'} (attempt #${evt.attempt})`,
        detail: null,
        color: '#fbbf24',
      };

    case 'approval_required':
      return {
        icon: '⏸',
        text: 'Waiting for your approval — 3 email drafts ready',
        detail: null,
        color: '#f59e0b',
      };

    case 'approval_granted':
      return {
        icon: '✓',
        text: 'Approval granted — outreach emails dispatched',
        detail: null,
        color: '#22c55e',
      };

    case 'approval_rejected':
      return {
        icon: '✕',
        text: 'Approval rejected — email dispatch cancelled',
        detail: null,
        color: '#f43f5e',
      };

    case 'verification_started':
      return {
        icon: '🔍',
        text: 'Running verification audit...',
        detail: null,
        color: '#4f8ef7',
      };

    case 'verification_completed':
      return {
        icon: '🛡',
        text: `Verification complete — ${evt.report?.score || 'all'} checks passed`,
        detail: evt.report?.summary,
        color: '#22c55e',
      };

    case 'mission_completed':
      return {
        icon: '🎯',
        text: 'Mission complete!',
        detail: null,
        color: '#22c55e',
      };

    default:
      return null; // Hide unknown events
  }
}

function labelForTask(id, action) {
  const labels = {
    search:    'Searching AI/ML opportunities',
    resume:    'Reading your candidate profile',
    deadlines: 'Checking application deadlines',
    match:     'Scoring and ranking top matches',
    save:      'Saving top 3 to application tracker',
    email:     'Generating personalized outreach',
    verify:    'Auditing results against specifications',
  };
  const name = labels[id] || id;
  if (action === 'started') return name;
  if (action === 'completed') return name + ' — done';
  if (action === 'failed') return name + ' — failed';
  return name;
}

export default function ActivityDrawer({ open, onClose, events }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const translated = events
    .map((e, i) => ({ ...translateEvent(e), raw: e, idx: i }))
    .filter(Boolean);

  return (
    <>
      {/* Backdrop when open */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.25)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="activity-drawer glass-elevated"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-4px 0 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-muted)',
                letterSpacing: '0.07em',
                marginBottom: '2px',
              }}
            >
              LIVE ACTIVITY
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Agent Trace
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {translated.length} events
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {translated.length === 0 ? (
            <div
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', textAlign: 'center', gap: '8px',
                paddingTop: '48px',
              }}
            >
              <div style={{ fontSize: 32 }}>⬦</div>
              <div style={{ fontSize: '13px' }}>Waiting for activity...</div>
            </div>
          ) : (
            translated.map(item => (
              <div
                key={item.idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animation: 'fade-up 0.3s ease both',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 24, height: 24,
                    borderRadius: '6px',
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '12px',
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {item.text}
                  </div>
                  {item.detail && (
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.detail}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {item.raw.timestamp || ''}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
