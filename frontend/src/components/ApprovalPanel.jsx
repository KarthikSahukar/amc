import React, { useState } from 'react';
import {
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
  User
} from 'lucide-react';

export default function ApprovalPanel({
  approvalData,
  onApprove,
  onReject,
  isOpen,
  onClose
}) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!approvalData) return null;

  const drafts = approvalData.drafts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-2xl rounded-2xl border-2 border-amber-500/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/40">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                HUMAN-IN-THE-LOOP APPROVAL REQUIRED
              </div>
              <h3 className="text-base font-bold text-white">
                Review & Authorize Outbound Email Applications
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
            {drafts.length} Drafts Ready
          </span>
        </div>

        {/* Informational Notice */}
        <div className="p-4 bg-slate-900/60 border-b border-white/5 text-xs text-slate-300 flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Safety Gate Triggered: Sensitive external mutation blocked until human confirmation.
          </span>
        </div>

        {/* Drafts List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {drafts.map((draft, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-slate-950/60 overflow-hidden transition-all"
              >
                {/* Draft Summary Header */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{draft.company}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({draft.role})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                        To: {draft.recipient}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-mono">#{idx + 1}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-white/5 bg-slate-900/40 flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Subject Line
                      </span>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-slate-200 font-mono text-xs font-medium">
                        {draft.subject}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        Personalized Pitch Body
                      </span>
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 text-slate-300 font-sans text-xs leading-relaxed whitespace-pre-line">
                        {draft.pitch}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onReject}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Reject & Cancel</span>
          </button>

          <button
            type="button"
            onClick={onApprove}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve All (Authorize Dispatch)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
