import React from 'react';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  Flame,
  CheckCircle,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function MissionPanel({
  goal,
  setGoal,
  status,
  progress,
  metrics,
  simulateFailure,
  setSimulateFailure,
  onStartMission,
  onResetMission,
  onOpenArtifacts,
  onOpenVerification
}) {
  const isRunning = status === 'EXECUTING' || status === 'PLANNING' || status === 'VERIFYING';
  const isWaiting = status === 'WAITING_APPROVAL';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* System Status Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`w-3.5 h-3.5 rounded-full inline-block ${
                isRunning
                  ? 'bg-cyan-400 animate-ping'
                  : isWaiting
                  ? 'bg-amber-400 animate-pulse'
                  : isCompleted
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full absolute top-0 left-0 ${
                isRunning
                  ? 'bg-cyan-400'
                  : isWaiting
                  ? 'bg-amber-400'
                  : isCompleted
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
              OperatorOS Status
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{status}</span>
              {isRunning && <span className="text-cyan-400 font-mono text-xs">(Autonomous Mode)</span>}
            </div>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2">
          {metrics?.recovered_failures > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>1 Recovered</span>
            </div>
          )}
          {metrics?.tool_calls_deduplicated > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>{metrics.tool_calls_deduplicated} Deduplicated</span>
            </div>
          )}
        </div>
      </div>

      {/* Mission Input Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            Active Mission Goal
          </label>
          <span className="text-[11px] text-slate-400 font-mono">pReAct Orchestrated</span>
        </div>

        <textarea
          rows={3}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={isRunning || isWaiting}
          className="w-full bg-slate-950/70 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans resize-none"
          placeholder="Enter high-level mission objective..."
        />

        {/* Demo Toggles */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                Simulate Transient Failure (Recovery Demo)
              </span>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              disabled={isRunning || isWaiting}
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onStartMission}
            disabled={isRunning || isWaiting}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isRunning || isWaiting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START MISSION</span>
          </button>

          <button
            onClick={onResetMission}
            disabled={isRunning}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Reset Mission"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Progress Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider">Mission Progress</span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
        <div className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center justify-between">
          <span>Execution Telemetry</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {metrics?.elapsed_time_seconds ? `${metrics.elapsed_time_seconds}s elapsed` : '0.0s'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Tasks Completed</span>
            <div className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>{metrics?.completed_tasks || 0}</span>
              <span className="text-xs text-slate-500">/ {metrics?.total_tasks || 8}</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Tool Invocations</span>
            <div className="text-base font-bold text-cyan-300">
              {metrics?.tool_calls_executed || 0}
              <span className="text-[10px] text-slate-500 ml-1">calls</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Parallel Batches</span>
            <div className="text-base font-bold text-sky-400">
              {metrics?.parallel_batches_executed || 0}
              <span className="text-[10px] text-slate-500 ml-1">concurrent</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Recovered Failures</span>
            <div className="text-base font-bold text-amber-400">
              {metrics?.recovered_failures || 0}
              <span className="text-[10px] text-slate-500 ml-1">restored</span>
            </div>
          </div>
        </div>

        {/* Latency Demonstration (Measured Benchmark vs Serial ReAct) */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/25 flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Latency Benchmark (Measured)
              </span>
            </div>
            <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
              pReAct Speedup
            </span>
          </div>

          <div className="font-mono text-[11px] flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Sequential (ReAct):</span>
              <span className="text-slate-200 font-semibold">{metrics?.sequential_time_seconds || '0.0'}s</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Parallel (OperatorOS):</span>
              <span className="text-cyan-400 font-bold">{metrics?.elapsed_time_seconds || '0.0'}s</span>
            </div>
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-emerald-400 font-bold">
              <span>Wall-Clock Reduction:</span>
              <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                {metrics?.latency_reduction_percent ? `${metrics.latency_reduction_percent}%` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Artifacts & Verification Triggers */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onOpenArtifacts}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>View Artifacts</span>
        </button>

        <button
          onClick={onOpenVerification}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Report</span>
        </button>
      </div>
    </div>
  );
}
