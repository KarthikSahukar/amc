import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Loader2, 
  ShieldAlert, 
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

const statusConfig = {
  PENDING: {
    border: 'border-slate-800',
    bg: 'bg-slate-900/70',
    text: 'text-slate-400',
    badge: 'bg-slate-800/80 text-slate-400 border-slate-700',
    icon: Clock,
    glow: '',
  },
  READY: {
    border: 'border-cyan-500/60',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    badge: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40',
    icon: ArrowRight,
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
  },
  RUNNING: {
    border: 'border-cyan-400',
    bg: 'bg-gradient-to-b from-cyan-950/80 to-slate-900/90',
    text: 'text-cyan-200',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse',
    icon: Loader2,
    iconSpin: true,
    glow: 'animate-glow-running',
  },
  SUCCESS: {
    border: 'border-emerald-500/80',
    bg: 'bg-gradient-to-b from-emerald-950/50 to-slate-900/90',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  FAILED: {
    border: 'border-rose-500',
    bg: 'bg-gradient-to-b from-rose-950/70 to-slate-900/90',
    text: 'text-rose-200',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500',
    icon: AlertTriangle,
    glow: 'animate-glow-failed',
  },
  RETRYING: {
    border: 'border-amber-500',
    bg: 'bg-gradient-to-b from-amber-950/60 to-slate-900/90',
    text: 'text-amber-200',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500',
    icon: RefreshCw,
    iconSpin: true,
    glow: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]',
  },
  WAITING_APPROVAL: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-b from-yellow-950/70 to-slate-900/90',
    text: 'text-yellow-200',
    badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/60 animate-pulse',
    icon: ShieldAlert,
    glow: 'animate-glow-approval',
  },
  SKIPPED: {
    border: 'border-slate-800',
    bg: 'bg-slate-950/40 opacity-40',
    text: 'text-slate-500',
    badge: 'bg-slate-900 text-slate-500 border-slate-800',
    icon: Clock,
    glow: '',
  }
};

const CustomTaskNode = memo(({ data, selected }) => {
  const status = data.status || 'PENDING';
  const cfg = statusConfig[status] || statusConfig.PENDING;
  const IconComponent = cfg.icon;

  return (
    <div
      className={`relative w-64 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer ${
        cfg.border
      } ${cfg.bg} ${cfg.glow} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.02]' : 'hover:scale-[1.01]'
      } p-3.5 shadow-xl`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-400 !border-slate-900 !w-3 !h-3 transition-colors hover:!bg-cyan-300"
      />

      {/* Header with Title and Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xl flex-shrink-0">{data.emoji || '⚙️'}</span>
          <span className="font-semibold text-sm tracking-wide text-slate-100 truncate">
            {data.title || data.id}
          </span>
        </div>

        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${cfg.badge}`}
        >
          <IconComponent
            className={`w-3 h-3 ${cfg.iconSpin ? 'animate-spin' : ''}`}
          />
          {status === 'WAITING_APPROVAL' ? 'APPROVAL' : status}
        </span>
      </div>

      {/* Description / Tool Call */}
      <p className="text-xs text-slate-400 line-clamp-2 mb-2.5 font-normal">
        {data.description || 'Autonomous agent task node'}
      </p>

      {/* Tool & Parallel Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
        {data.tool && (
          <span className="font-mono text-[10px] bg-slate-800/90 text-cyan-300 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1 truncate max-w-[170px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {data.tool}()
          </span>
        )}

        {data.isParallel && (
          <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
            ⚡ Concurrency
          </span>
        )}

        {data.hasCheckpoint && (
          <span className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1" title="Checkpoint saved">
            <Database className="w-2.5 h-2.5" />
            Saved
          </span>
        )}

        {data.retries > 0 && (
          <span className="text-[10px] bg-amber-950/70 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
            <RefreshCw className="w-2.5 h-2.5" />
            Retry #{data.retries}
          </span>
        )}
      </div>

      {/* Result preview snippet if available */}
      {data.resultPreview && (
        <div className="mt-2 text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-900/50 rounded px-2 py-1 truncate">
          ✓ {data.resultPreview}
        </div>
      )}

      {/* Error message snippet if failed */}
      {data.errorPreview && (
        <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded px-2 py-1 truncate flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
          <span className="truncate">{data.errorPreview}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-400 !border-slate-900 !w-3 !h-3 transition-colors hover:!bg-cyan-300"
      />
    </div>
  );
});

CustomTaskNode.displayName = 'CustomTaskNode';
export default CustomTaskNode;
