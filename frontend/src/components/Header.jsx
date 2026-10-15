import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  Settings2, 
  Play, 
  RotateCcw, 
  FileCheck2, 
  Radio, 
  Sparkles,
  Server,
  Layers
} from 'lucide-react';

export default function Header({ 
  missionStatus, 
  isBackendConnected, 
  backendUrl, 
  onUpdateBackendUrl,
  onStartDemo,
  onReset,
  onOpenResults,
  hasResults,
  isRunning
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(backendUrl);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    onUpdateBackendUrl(tempUrl);
    setShowSettings(false);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Brand & Mode */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">
                Operator<span className="text-cyan-400">OS</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                AUTONOMOUS MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visual Autonomous Mission Execution Engine (pReAct-inspired)
            </p>
          </div>
        </div>

        {/* Backend / Sim Status */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Radio className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {isBackendConnected ? 'FastAPI :8000 LIVE' : 'Interactive Demo Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Preset Rehearsal Demo */}
        <button
          onClick={onStartDemo}
          disabled={isRunning}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            isRunning 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
          }`}
          title="Run the complete Hackathon Demo Scenario (Scenes 1-7 with recovery)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Mission In Progress...' : 'Run Hackathon Demo'}</span>
        </button>

        {/* View Results Button */}
        <button
          onClick={onOpenResults}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            hasResults 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/50 animate-pulse' 
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Artifacts & Results</span>
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors"
          title="Reset Graph & Logs"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Configure Backend Connection"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-50">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Backend Configuration
                </h4>
              </div>
              <form onSubmit={handleSaveUrl} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    FastAPI Server URL (Section 25 API Contract)
                  </label>
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="http://localhost:8000"
                  />
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="font-semibold text-slate-300">Status: </span>
                  {isBackendConnected ? (
                    <span className="text-emerald-400">Connected to live backend</span>
                  ) : (
                    <span className="text-amber-400">Offline (automatic demo fallback active)</span>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow"
                  >
                    Apply URL
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
