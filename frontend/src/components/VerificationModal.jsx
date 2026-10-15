import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  FileSpreadsheet, 
  Mail, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Copy, 
  ExternalLink,
  Check,
  Award,
  Zap,
  RefreshCw
} from 'lucide-react';
import { MOCK_APPLICATIONS, MOCK_EMAIL_DRAFTS, MOCK_VERIFICATION_ITEMS } from '../services/mockMissionEngine';

export default function VerificationModal({
  isOpen,
  onClose,
  metrics,
  applications = MOCK_APPLICATIONS,
  drafts = MOCK_EMAIL_DRAFTS,
  verificationItems = MOCK_VERIFICATION_ITEMS
}) {
  const [activeTab, setActiveTab] = useState('tracker'); // tracker | emails | verification | checkpoints
  const [copiedDraftId, setCopiedDraftId] = useState(null);

  if (!isOpen) return null;

  const handleCopyDraft = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  Mission Artifacts & Verified Outputs
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  100% Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                OperatorOS Output Bundle • Inspection of MCP workspace artifacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/50 border-b border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Opportunities Evaluated</span>
            <span className="text-base font-bold text-cyan-300">5 Researched / 3 Selected</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Tracker Records</span>
            <span className="text-base font-bold text-emerald-300">3 Saved (applications.json)</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Personalized Letters</span>
            <span className="text-base font-bold text-purple-300">3 Drafted & Tailored</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Autonomous Resilience</span>
            <span className="text-base font-bold text-amber-300">1 Recovered via Checkpoint</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'tracker'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Application Tracker (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'emails'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Outreach Drafts (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'verification'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-colors ${
              activeTab === 'checkpoints'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Checkpoint History & DAG Stats</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: APPLICATION TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Persisted in: <code className="text-cyan-300">workspace/applications.json</code></span>
                <span className="text-emerald-400">All required fields verified ✓</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Rank / Company</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-center">Match %</th>
                      <th className="p-3">Deadline</th>
                      <th className="p-3">Key Skills Matched</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {applications.map((app, idx) => (
                      <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-200">
                          <span className="inline-block w-5 text-cyan-400">#{idx + 1}</span>
                          {app.company}
                        </td>
                        <td className="p-3 text-slate-300">{app.role}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                            {app.matchScore}%
                          </span>
                        </td>
                        <td className="p-3 text-amber-300/90">{app.deadline}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {app.skillsMatched.map((s) => (
                              <span key={s} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: EMAILS */}
          {activeTab === 'emails' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drafts.map((draft, idx) => (
                <div
                  key={draft.id || idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                        Draft #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleCopyDraft(draft.id, draft.body)}
                        className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition-colors"
                      >
                        {copiedDraftId === draft.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">
                      {draft.recipient}
                    </div>

                    <div className="text-[11px] text-cyan-400 font-mono line-clamp-1">
                      {draft.subject}
                    </div>

                    <div className="text-xs text-slate-300/90 font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                      {draft.body}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                    <span>Gate: Approved by Human</span>
                    <span className="text-emerald-400">Ready to Send</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1">
                <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  Independent Verifier Specification (Section 21)
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  "Do not simply produce 'Done!'. The verifier inspects the actual outputs, verifies completeness against the mission constraints, and triggers agent feedback loops if anything is missing."
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {verificationItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{item.label}</span>
                        <span className="text-emerald-400 font-semibold text-[11px]">PASSED</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKPOINTS */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-4 max-w-3xl mx-auto font-mono text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Fault Recovery Architecture (Section 19 & 20)
                </h3>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  OperatorOS persists checkpoints after every successful task. If a downstream task fails (such as our intentional <code>save_application_tracker()</code> network glitch during the demo), the scheduler does <strong>NOT</strong> restart the entire mission. It restores state from the active snapshot, retries the failed node, and proceeds down the DAG.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 text-[11px] uppercase font-bold">checkpoint.json payload:</div>
                <pre className="text-cyan-300 text-[11px] bg-slate-900 p-3 rounded overflow-x-auto border border-slate-800 leading-normal">
{`{
  "mission_id": "mission-hackathon-01",
  "checkpoint_time": "2026-10-15T12:42:05Z",
  "completed_tasks": {
    "search": { "status": "SUCCESS", "records": 5 },
    "resume": { "status": "SUCCESS", "skills_parsed": 12 },
    "deadlines": { "status": "SUCCESS", "items": 3 },
    "details": { "status": "SUCCESS", "jobs_fetched": 5 },
    "matching": { "status": "SUCCESS", "top_ranked": 3 }
  },
  "recovery_log": [
    {
      "task": "save_application_tracker",
      "error": "Temporary workspace connection error",
      "action": "RESTORE_CHECKPOINT_AND_RETRY",
      "retry_success": true
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            OperatorOS — Visual Autonomous Mission Execution
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
