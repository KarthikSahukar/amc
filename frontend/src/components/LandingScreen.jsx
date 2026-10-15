import React, { useState, useRef } from 'react';
import { ArrowRight, Zap, GitBranch, Cpu, ShieldCheck } from 'lucide-react';

const SUGGESTED = [
  'Research top AI/ML internships matching my profile',
  'Analyze competitor products and create comparison report',
  'Find relevant open-source projects and summarize activity',
  'Scout conference opportunities in machine learning',
];

const FEATURES = [
  { icon: GitBranch, label: 'Dependency-aware DAG', desc: 'Tasks planned as a parallel execution graph' },
  { icon: Zap, label: 'Parallel Execution', desc: 'Independent tasks run simultaneously' },
  { icon: Cpu, label: 'Model Context Protocol', desc: 'Research & Workspace MCP servers' },
  { icon: ShieldCheck, label: 'Human Approval Gate', desc: 'You stay in control of sensitive actions' },
];

export default function LandingScreen({ onExecute }) {
  const [goal, setGoal] = useState(
    'Find AI/ML internships matching my profile, compare them against my resume, save the best 3 to my tracker, and prepare personalized outreach emails.'
  );
  const [simulateFailure, setSimulateFailure] = useState(true);
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!goal.trim()) return;
    onExecute(goal.trim(), simulateFailure);
  };

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      className="ambient-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 screen-transition"
    >
      {/* Top logo */}
      <div className="flex items-center gap-2.5 mb-14 stagger-children">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)', boxShadow: '0 0 20px rgba(79,142,247,0.35)' }}
        >
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">OperatorOS</span>
        <span
          className="chip chip-blue"
          style={{ fontSize: '10px', padding: '2px 8px' }}
        >
          pReAct
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-10 stagger-children max-w-2xl">
        <h1
          className="text-5xl font-black tracking-tight text-white mb-4 leading-none"
          style={{ letterSpacing: '-0.03em' }}
        >
          Your mission.
          <br />
          <span style={{ background: 'linear-gradient(135deg, #4f8ef7, #93bbff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Executed.
          </span>
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Describe what you want to accomplish. OperatorOS breaks it into parallel tasks,<br />
          coordinates MCP tools, handles failures, and keeps you in control.
        </p>
      </div>

      {/* Input card */}
      <div
        className="w-full max-w-2xl glass rounded-2xl p-5 mb-4"
        style={{ border: '1px solid var(--border-default)' }}
      >
        <div className="text-xs font-semibold mb-3 mono" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          MISSION OBJECTIVE
        </div>
        <textarea
          ref={textareaRef}
          rows={4}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKey}
          className="mission-input"
          placeholder="Describe what you want the agent to accomplish..."
        />

        {/* Controls row */}
        <div className="flex items-center justify-between mt-4">
          {/* Simulate failure toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={simulateFailure}
                onChange={e => setSimulateFailure(e.target.checked)}
              />
              <div
                className="w-10 h-5 rounded-full transition-all duration-200 relative"
                style={{
                  background: simulateFailure
                    ? 'linear-gradient(90deg, var(--amber), #f97316)'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: simulateFailure ? '0 0 12px var(--amber-glow)' : 'none'
                }}
                onClick={() => setSimulateFailure(v => !v)}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200"
                  style={{ left: simulateFailure ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                />
              </div>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Demo: Simulate failure + recovery
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs mono" style={{ color: 'var(--text-muted)' }}>⌘↵ to execute</span>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleSubmit}
              disabled={!goal.trim()}
            >
              Execute Mission
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested missions */}
      <div className="w-full max-w-2xl mb-12">
        <div className="text-xs mb-3 mono" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          EXAMPLE MISSIONS
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s, i) => (
            <button
              key={i}
              onClick={() => setGoal(s)}
              className="btn-ghost text-xs"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Feature row */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3 stagger-children">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="glass rounded-xl p-4 flex items-start gap-3"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'var(--accent-dim)', border: '1px solid rgba(79,142,247,0.2)' }}
            >
              <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
