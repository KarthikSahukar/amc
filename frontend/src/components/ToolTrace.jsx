import React, { useRef, useEffect } from 'react';
import {
  Terminal,
  Zap,
  Search,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  ArrowDownCircle
} from 'lucide-react';

export default function ToolTrace({ events = [] }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getEventBadge = (event) => {
    switch (event.type) {
      case 'mission_planned':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-purple-400" />,
          color: 'text-purple-300 bg-purple-500/10 border-purple-500/30'
        };
      case 'parallel_batch_started':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
          color: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
        };
      case 'task_started':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-sky-400" />,
          color: 'text-sky-300 bg-sky-500/10 border-sky-500/30'
        };
      case 'task_deduplicated':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
          color: 'text-purple-300 bg-purple-500/20 border-purple-400'
        };
      case 'task_completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
        };
      case 'task_failed':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          color: 'text-rose-300 bg-rose-500/20 border-rose-500'
        };
      case 'checkpoint_restored':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-400" />,
          color: 'text-amber-300 bg-amber-500/20 border-amber-400'
        };
      case 'task_retry':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-300" />,
          color: 'text-amber-300 bg-amber-500/10 border-amber-500/30'
        };
      case 'approval_required':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
          color: 'text-yellow-300 bg-yellow-500/20 border-yellow-400'
        };
      case 'verification_completed':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400'
        };
      case 'mission_completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400'
        };
      default:
        return {
          icon: <Terminal className="w-3.5 h-3.5 text-slate-400" />,
          color: 'text-slate-300 bg-slate-800/60 border-slate-700'
        };
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            LIVE AGENT TRACE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
            {events.length} events
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Trace Log Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-3.5 overflow-y-auto font-mono text-xs flex flex-col gap-2.5 scanline-effect"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <Terminal className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs">Waiting for mission start...</p>
            <p className="text-[10px] text-slate-600 mt-1">Live tool telemetry will stream here in real time.</p>
          </div>
        ) : (
          events.map((evt, idx) => {
            const badge = getEventBadge(evt);
            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Timestamp */}
                <span className="text-[10px] text-slate-500 shrink-0 select-none pt-0.5">
                  {evt.timestamp || '00:00:00'}
                </span>

                {/* Event Icon */}
                <div className="pt-0.5 shrink-0">{badge.icon}</div>

                {/* Event Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {evt.task_id && (
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5 uppercase">
                        {evt.task_id}
                      </span>
                    )}
                    {evt.tool && (
                      <span className="text-[10px] text-cyan-400 font-semibold">
                        {evt.tool}()
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed break-words">
                    {evt.message || evt.result || evt.error || evt.description}
                  </p>

                  {/* Sub-details (duration or error details) */}
                  {evt.duration_ms && (
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      ✓ Execution finished in {evt.duration_ms}ms
                    </span>
                  )}
                  {evt.type === 'task_failed' && (
                    <span className="text-[10px] text-rose-400 block mt-0.5">
                      ⚠️ Triggering checkpoint restoration...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
