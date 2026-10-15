import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCheck, 
  XCircle, 
  Eye, 
  Mail, 
  Send, 
  AlertTriangle,
  User,
  Sparkles
} from 'lucide-react';
import { MOCK_EMAIL_DRAFTS } from '../services/mockMissionEngine';

export default function ApprovalPanel({
  isOpen,
  onApprove,
  onReject,
  drafts = MOCK_EMAIL_DRAFTS
}) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);

  if (!isOpen) return null;

  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  return (
    <>
      {/* Floating Bottom Alert Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="bg-gradient-to-r from-yellow-950/90 via-slate-900/95 to-yellow-950/90 border-2 border-yellow-500/80 rounded-2xl p-4 shadow-[0_0_40px_rgba(234,179,8,0.3)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 flex-shrink-0 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-yellow-300 uppercase tracking-wider font-mono">
                    ⚠ HUMAN APPROVAL REQUIRED
                  </h3>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-200 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono">
                    Sensitive Action Gate
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  <span className="font-semibold text-white">{drafts.length} personalized outreach emails</span> are ready to be dispatched.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center gap-1.5 shadow"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Review ({drafts.length})</span>
              </button>

              <button
                onClick={onReject}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 transition-colors flex items-center gap-1.5"
                title="Cancel email dispatch and finish safely"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                onClick={onApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-yellow-500/30 active:scale-95"
              >
                <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Approve All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Inspect Generated Email Drafts
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Verify personalized messaging generated from candidate resume match
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
              >
                Close
              </button>
            </div>

            {/* Modal Body: Draft Selector & Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Draft List Sidebar */}
              <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-3 space-y-2 overflow-y-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  Select Draft:
                </span>
                {drafts.map((draft, idx) => (
                  <button
                    key={draft.id || idx}
                    onClick={() => setSelectedDraftIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      selectedDraftIndex === idx
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-200 truncate">
                      {draft.recipient.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {draft.subject}
                    </div>
                  </button>
                ))}
              </div>

              {/* Draft Content Inspector */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/70 font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    To:
                  </span>
                  <div className="text-xs text-slate-200 bg-slate-950 p-2 rounded border border-slate-800">
                    {currentDraft.recipient} &lt;{currentDraft.email}&gt;
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Subject:
                  </span>
                  <div className="text-xs font-semibold text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    {currentDraft.subject}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Personalized Message:
                  </span>
                  <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded border border-slate-800 whitespace-pre-line leading-relaxed">
                    {currentDraft.body}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Gate: Human approval enforces safe external action execution
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    onReject();
                  }}
                  className="px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/50 rounded-lg border border-rose-900/60"
                >
                  Reject All
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    onApprove();
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow"
                >
                  Confirm & Approve All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
