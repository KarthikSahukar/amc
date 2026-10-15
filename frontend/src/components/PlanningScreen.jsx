import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

const PLANNING_STEPS = [
  { delay: 0,    text: 'Receiving mission...' },
  { delay: 700,  text: 'Understanding objective...' },
  { delay: 1500, text: 'Identifying required actions...' },
  { delay: 2400, text: 'Resolving dependencies...' },
  { delay: 3300, text: 'Building execution plan...' },
  { delay: 4000, text: 'Constructing task graph...' },
];

export default function PlanningScreen({ goal, onPlanReady }) {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = PLANNING_STEPS.map((step, i) =>
      setTimeout(() => {
        setVisibleSteps(prev => [...prev, i]);
      }, step.delay)
    );

    // Signal ready to parent after last step
    const doneTimer = setTimeout(() => {
      setDone(true);
    }, 4800);

    const callbackTimer = setTimeout(() => {
      if (onPlanReady) onPlanReady();
    }, 5400);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      clearTimeout(callbackTimer);
    };
  }, []);

  return (
    <div className="ambient-bg min-h-screen flex flex-col items-center justify-center px-6 screen-transition">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-16">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)', boxShadow: '0 0 20px rgba(79,142,247,0.35)' }}
        >
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">OperatorOS</span>
      </div>

      {/* Mission card */}
      <div
        className="glass rounded-xl px-5 py-3 mb-12 max-w-lg w-full text-center"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-xs mono mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
          MISSION RECEIVED
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {goal.length > 100 ? goal.slice(0, 100) + '...' : goal}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {PLANNING_STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 transition-all duration-500"
            style={{
              opacity: visibleSteps.includes(i) ? 1 : 0,
              transform: visibleSteps.includes(i) ? 'translateY(0)' : 'translateY(8px)',
              transitionDelay: '0ms',
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: visibleSteps.includes(i) ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${visibleSteps.includes(i) ? 'rgba(79,142,247,0.4)' : 'var(--border-subtle)'}`,
              }}
            >
              {i < visibleSteps.length - 1 ? (
                <svg className="w-3 h-3" style={{ color: 'var(--green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : visibleSteps.includes(i) ? (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'var(--accent)',
                    animation: 'pulse-ring 1.5s ease-in-out infinite',
                  }}
                />
              ) : null}
            </div>
            <span
              className="text-sm"
              style={{
                color: i === Math.max(...visibleSteps) ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: i === Math.max(...visibleSteps) ? 600 : 400,
              }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      {done && (
        <div
          className="mt-12 text-sm font-medium"
          style={{ color: 'var(--green)', animation: 'fade-in 0.5s ease both' }}
        >
          Execution plan ready — launching graph...
        </div>
      )}
    </div>
  );
}
