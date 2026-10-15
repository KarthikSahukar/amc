import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  FileCheck,
  Award
} from 'lucide-react';

export default function VerificationModal({ report, isOpen, onClose }) {
  if (!isOpen) return null;

  const checks = report?.checks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-xl rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                MISSION VERIFICATION AUDIT
              </div>
              <h3 className="text-base font-bold text-white">
                Multi-Point Outcome Inspection
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Summary Banner */}
        <div className="p-4 bg-slate-900/60 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-mono">
              Audit Score: <strong className="text-emerald-400">{report?.score || '5/5 Passed'}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            VERIFIED
          </span>
        </div>

        {/* Audit Checklist */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {checks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No verification checks recorded yet. Run a mission to view the audit.
            </div>
          ) : (
            checks.map((check, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-3"
              >
                <div className="pt-0.5">
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-200">
                    {check.criterion}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {check.details}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>pReAct Verifier Engine</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
