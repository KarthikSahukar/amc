import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  ArrowDown, 
  Filter, 
  ShieldAlert, 
  RotateCcw, 
  Database,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ToolTrace({ logs = [], onClear }) {
  const [filter, setFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'TOOLS') return log.type === 'tool' || log.category === 'mcp';
    if (filter === 'PARALLEL') return log.category === 'parallel' || log.text.includes('⚡') || log.text.includes('independent');
    if (filter === 'RECOVERY') return log.category === 'recovery' || log.type === 'error' || log.type === 'retry' || log.type === 'checkpoint';
    return true;
  });

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.emoji || ''} ${l.text} ${l.details ? `\n   ${l.details}` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogStyle = (log) => {
    switch (log.type) {
      case 'error':
        return 'border-l-2 border-rose-500 bg-rose-950/20 text-rose-300';
      case 'retry':
        return 'border-l-2 border-amber-500 bg-amber-950/20 text-amber-300';
      case 'checkpoint':
        return 'border-l-2 border-blue-500 bg-blue-950/20 text-blue-300';
      case 'success':
        return 'border-l-2 border-emerald-500 bg-emerald-950/15 text-emerald-300';
      case 'parallel':
        return 'border-l-2 border-purple-500 bg-purple-950/20 text-purple-300';
      case 'approval':
        return 'border-l-2 border-yellow-500 bg-yellow-950/30 text-yellow-300';
      default:
        return 'border-l-2 border-slate-700 hover:border-cyan-500 text-slate-300';
    }
  };

  return (
    <aside className="w-88 border-l border-slate-800 bg-slate-950/60 backdrop-blur flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Live Tool Trace
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy trace log"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono bg-slate-950/40 overflow-x-auto">
        {['ALL', 'TOOLS', 'PARALLEL', 'RECOVERY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
              filter === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terminal Stream */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
            <Terminal className="w-8 h-8 stroke-[1.2] mb-2 text-slate-600" />
            <p className="text-xs">Waiting for mission events...</p>
            <p className="text-[10px] text-slate-600 mt-1">Start mission to stream live tool execution.</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className={`p-2 rounded-r bg-slate-900/60 transition-all ${getLogStyle(log)}`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="font-semibold text-slate-400">{log.timestamp}</span>
                {log.tool && (
                  <span className="text-cyan-400 bg-cyan-950/60 px-1 rounded text-[9px] border border-cyan-800/40">
                    {log.tool}()
                  </span>
                )}
              </div>

              <div className="flex items-start gap-1.5 text-slate-200">
                <span className="text-sm leading-none flex-shrink-0 mt-0.5">{log.emoji}</span>
                <div className="flex-1 break-words">
                  <span className="font-medium">{log.text}</span>
                  {log.details && (
                    <div className="text-[10px] text-slate-400 mt-1 bg-slate-950/70 p-1.5 rounded border border-slate-800 font-mono overflow-x-auto">
                      {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Auto-scroll Controller */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
          />
          <span>Auto-scroll</span>
        </label>
        <span className="text-slate-400">MCP Stream: Active</span>
      </div>
    </aside>
  );
}
