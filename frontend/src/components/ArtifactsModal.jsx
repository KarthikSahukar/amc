import React, { useState, useEffect } from 'react';
import {
  FileText,
  Table,
  Mail,
  X,
  ExternalLink,
  Download,
  Building,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function ArtifactsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' or 'drafts'
  const [artifacts, setArtifacts] = useState({ tracker: {}, drafts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchArtifacts();
    }
  }, [isOpen]);

  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/workspace/artifacts');
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data);
      }
    } catch (e) {
      console.error('Failed to load artifacts:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const applications = artifacts.tracker?.applications || [];
  const drafts = artifacts.drafts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-3xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                WORKSPACE MCP ARTIFACTS
              </div>
              <h3 className="text-base font-bold text-white">
                Generated Applications & Cold Email Drafts
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

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-white/5">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              activeTab === 'tracker'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Application Tracker ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
              activeTab === 'drafts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Drafts ({drafts.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'tracker' ? (
            <div className="flex flex-col gap-3">
              {applications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No applications saved yet. Run the mission to populate the tracker.
                </div>
              ) : (
                applications.map((app, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-bold text-white">
                          {app.company}
                        </h4>
                        <span className="text-xs text-slate-400">
                          - {app.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {app.match_score || 95}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-1">
                      <span>📍 {app.location}</span>
                      <span>💰 {app.stipend}</span>
                      <span>⏰ Deadline: {app.deadline}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(app.skills || []).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-white/5 text-[10px] text-slate-300 font-mono"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {drafts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No email drafts generated yet.
                </div>
              ) : (
                drafts.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        {d.company} ({d.role})
                      </span>
                      <span className="text-slate-400 font-mono">
                        To: {d.contact_email}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 font-mono text-xs text-cyan-300">
                      Subject: {d.subject}
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {d.body}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Persisted in backend/data/</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
