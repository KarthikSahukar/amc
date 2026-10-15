import React from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Layers, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  Sliders, 
  Database,
  Filter
} from 'lucide-react';
import { INITIAL_MISSION_TEXT } from '../services/mockMissionEngine';

export default function MissionPanel({
  missionGoal,
  onMissionGoalChange,
  onStartMission,
  missionStatus,
  progress,
  metrics,
  isRunning,
  checkpointInfo
}) {
  const isComplete = missionStatus === 'COMPLETED';

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-950/60 backdrop-blur flex flex-col h-full overflow-y-auto">
      {/* Section 1: User Mission Input */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Mission Prompt
          </label>
          <button
            onClick={() => onMissionGoalChange(INITIAL_MISSION_TEXT)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/50"
            title="Load the standard hackathon demo mission"
          >
            Load Demo Prompt
          </button>
        </div>

        <textarea
          value={missionGoal}
          onChange={(e) => onMissionGoalChange(e.target.value)}
          rows={4}
          disabled={isRunning}
          placeholder="Enter an autonomous mission (e.g., research, extract, rank, persist)..."
          className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-all disabled:opacity-60"
        />

        <button
          onClick={onStartMission}
          disabled={isRunning || !missionGoal.trim()}
          className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
            isRunning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-98'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>EXECUTING MISSION...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START MISSION</span>
            </>
          )}
        </button>
      </div>

      {/* Section 2: Mission Status & Progress */}
      <div className="p-4 border-b border-slate-800 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
            <span>Status</span>
            <span className="font-mono text-[11px] text-slate-300">
              {metrics.completedTasks} / {metrics.totalTasks} tasks
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                missionStatus === 'RUNNING'
                  ? 'bg-cyan-400 animate-ping'
                  : missionStatus === 'COMPLETED'
                  ? 'bg-emerald-400'
                  : missionStatus === 'WAITING_APPROVAL'
                  ? 'bg-yellow-400 animate-bounce'
                  : missionStatus === 'FAILED'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
            ></span>
            <span className="font-mono font-bold text-xs uppercase tracking-wide text-slate-100">
              {missionStatus}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>PROGRESS</span>
            <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden p-[1px]">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Section 3: Key Mission Execution Metrics */}
      <div className="p-4 border-b border-slate-800 flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Execution Metrics
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Tool Calls */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Tool Calls
            </span>
            <span className="text-lg font-mono font-bold text-cyan-300">
              {metrics.toolCalls}
            </span>
          </div>

          {/* Parallel Calls */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Parallel Calls
            </span>
            <span className="text-lg font-mono font-bold text-purple-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              {metrics.parallelCalls}
            </span>
          </div>

          {/* Deduplication Metric (Section 18) */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Deduplication
            </span>
            <span className="text-lg font-mono font-bold text-blue-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              {metrics.duplicatesRemoved} removed
            </span>
          </div>

          {/* Recovered Failures (Section 20) */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Recoveries
            </span>
            <span className="text-lg font-mono font-bold text-amber-300 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              {metrics.recoveredFailures}
            </span>
          </div>
        </div>

        {/* Deduplication Detail banner */}
        <div className="mt-3 bg-slate-900/50 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-400 font-mono">
          <div className="text-slate-300 font-semibold mb-0.5">pReAct Deduplication:</div>
          <div>{metrics.toolCallsProposed} calls proposed → {metrics.duplicatesRemoved} dupes filtered → {metrics.toolCalls} executed</div>
        </div>

        {/* Checkpoint Status Banner (Section 19) */}
        {checkpointInfo && (
          <div className="mt-3 bg-blue-950/30 border border-blue-900/50 rounded-lg p-2 text-[11px] text-blue-300 font-mono flex items-start gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200">Checkpoint Active:</span> {checkpointInfo.id}
              <div className="text-[10px] text-blue-400/80">{checkpointInfo.tasksSaved} task states backed up</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Architecture Inspiration tag */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
        <span className="text-cyan-400 font-semibold">OperatorOS Engine:</span> Independent MCP tools run concurrently; dependent nodes unlock dynamically on result satisfaction.
      </div>
    </aside>
  );
}
