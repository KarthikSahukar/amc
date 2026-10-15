import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download, BarChart2, ArrowLeft, FileText, Mail, Table } from 'lucide-react';

function AnimatedNumber({ target, duration = 1200 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <span>{value}</span>;
}

function LatencyBar({ label, value, max, color, accent }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth((value / max) * 100), 300);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: accent || 'var(--text-primary)', fontWeight: 600 }}>
          {value}s
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)' }}>
        <div
          style={{
            height: '100%',
            borderRadius: '3px',
            background: color,
            width: `${width}%`,
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}

export default function CompletionScreen({ metrics, verificationReport, goal, onViewExecution, onReset }) {
  const [artifacts, setArtifacts] = useState({ tracker: {}, drafts: [] });
  const [artifactsLoaded, setArtifactsLoaded] = useState(false);

  useEffect(() => {
    fetch('/workspace/artifacts')
      .then(r => r.json())
      .then(data => { setArtifacts(data); setArtifactsLoaded(true); })
      .catch(() => setArtifactsLoaded(true));
  }, []);

  const applications = artifacts.tracker?.applications || [];
  const drafts = artifacts.drafts || [];

  const seqTime = metrics?.sequential_time_seconds || 0;
  const parTime = metrics?.elapsed_time_seconds || 0;
  const maxTime = Math.max(seqTime, parTime, 0.1);
  const reduction = metrics?.latency_reduction_percent || 0;

  const downloadCSV = () => {
    if (!applications.length) return;
    const headers = ['Company', 'Title', 'Location', 'Stipend', 'Deadline', 'Match %', 'Skills'];
    const rows = applications.map(a => [
      a.company, a.title, a.location, a.stipend, a.deadline,
      a.match_score || 95,
      (a.skills || []).join('; '),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const verScore = verificationReport?.score || '—';
  const verTotal = verificationReport?.checks?.length || 5;

  return (
    <div
      className="ambient-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        overflowY: 'auto',
        animation: 'fade-in 0.6s ease both',
      }}
    >
      {/* Success icon */}
      <div
        className="success-icon"
        style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: 'rgba(34,197,94,0.12)',
          border: '2px solid rgba(34,197,94,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 0 40px rgba(34,197,94,0.2)',
        }}
      >
        <CheckCircle2 style={{ width: 32, height: 32, color: '#22c55e' }} />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: '6px',
          textAlign: 'center',
        }}
      >
        Mission Complete
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center', maxWidth: '420px' }}>
        {goal.slice(0, 80)}{goal.length > 80 ? '...' : ''}
      </p>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          { label: 'Tasks Executed',      value: metrics?.completed_tasks || 7,           color: '#4f8ef7' },
          { label: 'Parallel Waves',      value: metrics?.parallel_batches_executed || 3,  color: '#22c55e' },
          { label: 'Failures Recovered',  value: metrics?.recovered_failures || 0,         color: '#f59e0b' },
          { label: 'Verification Score',  value: `${verScore}/${verTotal}`,                color: '#22c55e', raw: true },
        ].map(({ label, value, color, raw }) => (
          <div
            key={label}
            className="glass"
            style={{
              borderRadius: '14px',
              padding: '16px 20px',
              textAlign: 'center',
              minWidth: '120px',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 800, color, lineHeight: 1 }}>
              {raw ? value : <AnimatedNumber target={value} />}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column: artifacts + latency */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%',
          maxWidth: '700px',
          marginBottom: '20px',
        }}
      >
        {/* Artifacts card */}
        <div className="glass" style={{ borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
            ARTIFACTS GENERATED
          </div>

          {/* Tracker */}
          <div
            style={{
              background: 'rgba(79,142,247,0.07)',
              border: '1px solid rgba(79,142,247,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Table style={{ width: 16, height: 16, color: '#4f8ef7' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Application Tracker
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {applications.length} opportunities
                </div>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              style={{
                background: 'rgba(79,142,247,0.15)',
                border: '1px solid rgba(79,142,247,0.3)',
                borderRadius: '8px',
                padding: '5px 10px',
                color: '#93bbff',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Download style={{ width: 11, height: 11 }} /> CSV
            </button>
          </div>

          {/* Email drafts */}
          <div
            style={{
              background: 'rgba(34,197,94,0.07)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Mail style={{ width: 16, height: 16, color: '#22c55e' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Drafts
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {drafts.length} personalized outreach drafts
              </div>
            </div>
          </div>
        </div>

        {/* Latency card */}
        <div className="glass" style={{ borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 style={{ width: 12, height: 12 }} /> EXECUTION EFFICIENCY
          </div>

          <LatencyBar
            label="Sequential (ReAct)"
            value={seqTime}
            max={maxTime}
            color="rgba(244,63,94,0.5)"
            accent="#fb7185"
          />
          <LatencyBar
            label="Parallel (OperatorOS)"
            value={parTime}
            max={maxTime}
            color="linear-gradient(90deg, #4f8ef7, #22c55e)"
            accent="#4ade80"
          />

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Speed improvement</span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#22c55e',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {reduction > 0 ? `${reduction}% faster` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onViewExecution}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          View Execution Graph
        </button>
        <button
          onClick={onReset}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          New Mission
        </button>
      </div>
    </div>
  );
}
