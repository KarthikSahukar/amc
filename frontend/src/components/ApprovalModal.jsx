import React, { useState } from 'react';
import { ShieldCheck, Mail, CheckCircle, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function ApprovalModal({ approvalData, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(0);

  if (!approvalData) return null;

  const drafts = approvalData.drafts || [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(12px)',
        animation: 'fade-in 0.25s ease both',
        padding: '16px',
      }}
    >
      <div
        className="glass-elevated"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 0 60px rgba(245,158,11,0.12), 0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: 40, height: 40,
              borderRadius: '12px',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle style={{ width: 20, height: 20, color: '#f59e0b' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b', letterSpacing: '0.07em', marginBottom: '4px' }}>
              HUMAN APPROVAL REQUIRED
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              Action Requires Your Authorization
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              The agent has prepared outreach for {drafts.length} opportunities. Review before continuing.
            </div>
          </div>
        </div>

        {/* Safety notice */}
        <div
          style={{
            padding: '10px 24px',
            background: 'rgba(79,142,247,0.06)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <ShieldCheck style={{ width: 14, height: 14, color: '#4f8ef7', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Sensitive external action blocked until you approve — this is the <strong style={{ color: 'var(--text-primary)' }}>human-in-the-loop safety gate</strong>.
          </span>
        </div>

        {/* Drafts */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {drafts.map((draft, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: `1px solid ${expanded === idx ? 'rgba(79,142,247,0.3)' : 'var(--border-subtle)'}`,
                background: expanded === idx ? 'rgba(79,142,247,0.04)' : 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Collapsed header */}
              <button
                onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 32, height: 32,
                    borderRadius: '8px',
                    background: 'rgba(79,142,247,0.1)',
                    border: '1px solid rgba(79,142,247,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Mail style={{ width: 14, height: 14, color: '#4f8ef7' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {draft.company}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {draft.role} · {draft.recipient}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {expanded === idx
                    ? <ChevronUp style={{ width: 16, height: 16 }} />
                    : <ChevronDown style={{ width: 16, height: 16 }} />
                  }
                </div>
              </button>

              {/* Expanded content */}
              {expanded === idx && (
                <div
                  style={{
                    padding: '0 14px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ paddingTop: '10px' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>
                      SUBJECT
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--text-primary)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                      }}
                    >
                      {draft.subject}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>
                      PITCH
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                      }}
                    >
                      {draft.pitch}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <button
            onClick={onReject}
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: '#fb7185',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <X style={{ width: 14, height: 14 }} />
            Reject
          </button>
          <button
            onClick={onApprove}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
              transition: 'all 0.15s',
            }}
          >
            <CheckCircle style={{ width: 14, height: 14 }} />
            Approve All
          </button>
        </div>
      </div>
    </div>
  );
}
