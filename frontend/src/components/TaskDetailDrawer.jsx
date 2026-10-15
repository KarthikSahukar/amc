import React from 'react';
import { 
  X, 
  Terminal, 
  Database, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Code
} from 'lucide-react';

export default function TaskDetailDrawer({ node, onClose }) {
  if (!node) return null;

  const { data } = node;
  const status = data.status || 'PENDING';

  return (
    <div className="absolute top-4 right-4 z-30 w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col max-h-[calc(100%-2rem)] overflow-hidden animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-2xl">{data.emoji || '⚙️'}</span>
          <div className="truncate">
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide truncate">
              {data.title || data.id}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Task Node Inspector
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs font-mono">
        {/* Status & Timing */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Execution Status
          </span>
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === 'RUNNING' ? 'bg-cyan-400 animate-ping' :
                status === 'SUCCESS' ? 'bg-emerald-400' :
                status === 'FAILED' ? 'bg-rose-500' :
                status === 'WAITING_APPROVAL' ? 'bg-yellow-400' : 'bg-slate-500'
              }`}></span>
              {status}
            </span>

            {data.isParallel && (
              <span className="text-[10px] text-purple-300 bg-purple-950/70 border border-purple-600/40 px-2 py-0.5 rounded">
                ⚡ Parallel Batch
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Description
          </span>
          <p className="text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-sans">
            {data.description || 'No description provided'}
          </p>
        </div>

        {/* MCP Tool & Parameters */}
        {data.tool && (
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              MCP Tool Binding
            </span>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                {data.tool}()
              </div>

              {data.arguments && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Arguments:</span>
                  <pre className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto">
                    {JSON.stringify(data.arguments, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dependencies */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Upstream Dependencies (DAG)
          </span>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {data.depends_on && data.depends_on.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.depends_on.map((dep) => (
                  <span
                    key={dep}
                    className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[11px] border border-slate-700"
                  >
                    ↳ {dep}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-500 italic">None (Root independent task)</span>
            )}
          </div>
        </div>

        {/* Checkpoint Status */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            State Checkpointing (Section 19)
          </span>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              {data.hasCheckpoint || status === 'SUCCESS' ? 'Snapshot Committed' : 'Uncommitted'}
            </span>
            <span className="text-[10px] text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
              checkpoint.json
            </span>
          </div>
        </div>

        {/* Result or Error preview */}
        {data.resultPreview && (
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
              Task Output Result
            </span>
            <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 p-2.5 rounded-lg">
              {data.resultPreview}
            </div>
          </div>
        )}

        {data.errorPreview && (
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
              Error Trace & Recovery Info
            </span>
            <div className="bg-rose-950/40 border border-rose-900/60 text-rose-200 p-2.5 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {data.errorPreview}
              </div>
              <p className="text-[10px] text-rose-300/80">
                Automatic recovery: State restored from previous checkpoint snapshot. Retried cleanly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 font-mono"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
