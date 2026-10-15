import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Server
} from 'lucide-react';

import ExecutionGraph from './components/ExecutionGraph';
import MissionPanel from './components/MissionPanel';
import ToolTrace from './components/ToolTrace';
import ApprovalPanel from './components/ApprovalPanel';
import VerificationModal from './components/VerificationModal';
import ArtifactsModal from './components/ArtifactsModal';

const DEFAULT_GOAL =
  'Find 5 AI/ML internships suitable for me, compare them against my resume, save the best 3 to my application tracker, and prepare personalized emails.';

export default function App() {
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [missionId, setMissionId] = useState(null);
  const [status, setStatus] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({
    total_tasks: 8,
    completed_tasks: 0,
    tool_calls_proposed: 0,
    tool_calls_deduplicated: 0,
    tool_calls_executed: 0,
    parallel_batches_executed: 0,
    recovered_failures: 0,
    elapsed_time_seconds: 0
  });

  const [simulateFailure, setSimulateFailure] = useState(true);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [verificationReport, setVerificationReport] = useState(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [isArchInfoOpen, setIsArchInfoOpen] = useState(false);

  const socketRef = useRef(null);

  // Initialize canonical task template on start
  useEffect(() => {
    resetMissionState();
  }, []);

  const resetMissionState = () => {
    setStatus('IDLE');
    setProgress(0);
    setMissionId(null);
    setEvents([]);
    setPendingApproval(null);
    setVerificationReport(null);
    setMetrics({
      total_tasks: 7,
      completed_tasks: 0,
      tool_calls_proposed: 0,
      tool_calls_deduplicated: 0,
      tool_calls_executed: 0,
      parallel_batches_executed: 0,
      recovered_failures: 0,
      elapsed_time_seconds: 0,
      sequential_time_seconds: 0,
      latency_reduction_percent: 0
    });

    setTasks([
      { id: 'search', description: 'Search AI/ML & Agentic internships', tool: 'search_jobs', category: 'Research', status: 'PENDING' },
      { id: 'resume', description: 'Read candidate resume & extract profile', tool: 'read_resume', category: 'Workspace', status: 'PENDING' },
      { id: 'deadlines', description: 'Cross-check application deadlines (dedup)', tool: 'search_jobs', category: 'Research', status: 'PENDING' },
      { id: 'match', description: 'Score, rank and select top 3 roles', tool: null, category: 'Reasoning', status: 'PENDING' },
      { id: 'save', description: 'Save top 3 records to Application Tracker', tool: 'save_application_tracker', category: 'Workspace', status: 'PENDING' },
      { id: 'email', description: 'Draft personalized cold outreach emails (Human Gate)', tool: 'create_email_draft', category: 'Workspace', status: 'PENDING' },
      { id: 'verify', description: 'Audit output results against specifications', tool: null, category: 'Verification', status: 'PENDING' }
    ]);
  };

  // Connect WebSocket / SSE to stream real-time events
  const connectTelemetry = (id) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${id}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleStreamEvent(data);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onerror = () => {
      // Fallback to Server-Sent Events (SSE) if WebSocket fails
      console.warn('WebSocket connection failed, falling back to SSE...');
      const eventSource = new EventSource(`/mission/${id}/events`);
      eventSource.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          handleStreamEvent(data);
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };
    };
  };

  const handleStreamEvent = (evt) => {
    if (evt.type === 'init') {
      const state = evt.state;
      setStatus(state.status);
      setProgress(state.progress);
      setTasks(state.tasks);
      setMetrics(state.metrics);
      if (state.pending_approval) {
        setPendingApproval(state.pending_approval);
      }
      return;
    }

    // Append to live tool trace
    setEvents((prev) => [...prev, evt]);

    // Update Progress
    if (evt.progress !== undefined) {
      setProgress(evt.progress);
    }

    // Handle Task Status Changes
    if (evt.task_id) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === evt.task_id) {
            let nextStatus = t.status;
            let retryCount = t.retry_count || 0;
            let duration_ms = t.duration_ms;

            if (evt.type === 'task_started') nextStatus = 'RUNNING';
            else if (evt.type === 'task_completed') {
              nextStatus = 'SUCCESS';
              duration_ms = evt.duration_ms;
            } else if (evt.type === 'task_failed') nextStatus = 'FAILED';
            else if (evt.type === 'task_retry') {
              nextStatus = 'RETRYING';
              retryCount = evt.attempt || retryCount + 1;
            } else if (evt.type === 'approval_required') nextStatus = 'WAITING_APPROVAL';

            return {
              ...t,
              status: nextStatus,
              retry_count: retryCount,
              duration_ms: duration_ms || t.duration_ms
            };
          }
          return t;
        })
      );
    }

    // Handle deduplication count
    if (evt.type === 'task_deduplicated') {
      setMetrics((m) => ({
        ...m,
        tool_calls_deduplicated: m.tool_calls_deduplicated + 1
      }));
    }

    // Handle Human Approval Gate
    if (evt.type === 'approval_required') {
      setStatus('WAITING_APPROVAL');
      setPendingApproval(evt.data);
    } else if (evt.type === 'approval_granted' || evt.type === 'approval_rejected') {
      setPendingApproval(null);
      setStatus('EXECUTING');
    }

    // Handle Verification
    if (evt.type === 'verification_completed') {
      setVerificationReport(evt.report);
      setIsVerificationOpen(true);
    }

    // Handle Mission Completion
    if (evt.type === 'mission_completed') {
      setStatus('COMPLETED');
      setProgress(100);
      if (evt.metrics) setMetrics(evt.metrics);

      // Trigger victory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Launch Mission
  const startMission = async () => {
    resetMissionState();
    setStatus('PLANNING');

    try {
      const res = await fetch('/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goal,
          simulate_failure: simulateFailure,
          auto_approve: false
        })
      });

      if (!res.ok) throw new Error('Failed to start mission');
      const data = await res.json();
      setMissionId(data.mission_id);
      connectTelemetry(data.mission_id);
    } catch (err) {
      console.error(err);
      setStatus('FAILED');
      setEvents((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Mission initialization failed: ${err.message}`
        }
      ]);
    }
  };

  // Approval Handlers
  const handleApprove = async () => {
    if (!missionId) return;
    try {
      await fetch(`/mission/${missionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      setPendingApproval(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!missionId) return;
    try {
      await fetch(`/mission/${missionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: 'Denied by user' })
      });
      setPendingApproval(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-white/10 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                OperatorOS
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                v1.0 (pReAct)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Autonomous Mission Orchestrator • Model Context Protocol (MCP)
            </p>
          </div>
        </div>

        {/* Status Center Banner */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'EXECUTING'
                  ? 'bg-cyan-400 animate-ping'
                  : status === 'WAITING_APPROVAL'
                  ? 'bg-amber-400 animate-pulse'
                  : status === 'COMPLETED'
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-300 uppercase tracking-wider font-semibold">
              {status === 'IDLE' ? 'STANDBY' : status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>MCP Servers:</span>
            <span className="text-emerald-400 font-semibold">2 Connected</span>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsArchInfoOpen(!isArchInfoOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors text-xs flex items-center gap-1.5 font-mono"
            title="Architecture Story"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Architecture</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (3-Column Layout) */}
      <main className="h-[calc(100vh-3.5rem)] p-4 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Mission Control & Telemetry Panel (3 cols) */}
        <div className="col-span-12 lg:col-span-3 h-full overflow-y-auto">
          <MissionPanel
            goal={goal}
            setGoal={setGoal}
            status={status}
            progress={progress}
            metrics={metrics}
            simulateFailure={simulateFailure}
            setSimulateFailure={setSimulateFailure}
            onStartMission={startMission}
            onResetMission={resetMissionState}
            onOpenArtifacts={() => setIsArtifactsOpen(true)}
            onOpenVerification={() => setIsVerificationOpen(true)}
          />
        </div>

        {/* Center Column: Live Execution Graph / DAG (6 cols) */}
        <div className="col-span-12 lg:col-span-6 h-full flex flex-col">
          <ExecutionGraph tasks={tasks} />
        </div>

        {/* Right Column: Live Agent Trace Terminal (3 cols) */}
        <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
          <ToolTrace events={events} />
        </div>
      </main>

      {/* Human Approval Gate Modal */}
      <ApprovalPanel
        approvalData={pendingApproval}
        isOpen={Boolean(pendingApproval)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Verification Audit Modal */}
      <VerificationModal
        report={verificationReport}
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      {/* Artifacts Inspection Modal */}
      <ArtifactsModal
        isOpen={isArtifactsOpen}
        onClose={() => setIsArtifactsOpen(false)}
      />

      {/* Architecture Explanation Drawer / Modal */}
      {isArchInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-white/15 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  OperatorOS Technical Architecture (pReAct)
                </h3>
              </div>
              <button
                onClick={() => setIsArchInfoOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 flex flex-col gap-3 font-sans leading-relaxed">
              <p>
                <strong className="text-cyan-300">1. Decoupled Planning from Execution:</strong>{' '}
                Instead of forcing the LLM through a strictly sequential ReAct loop, the planner
                constructs a directed acyclic graph (DAG) of tasks.
              </p>
              <p>
                <strong className="text-cyan-300">2. Categorical Tool Partitioning (MCP):</strong>{' '}
                Tools are partitioned into semantically coherent servers (<code>ResearchMCP</code> and{' '}
                <code>WorkspaceMCP</code>), bounding prefill costs and eliminating tool hallucination.
              </p>
              <p>
                <strong className="text-cyan-300">3. Parallel Dispatch & Deduplication:</strong>{' '}
                Independent ready tasks run concurrently via <code>asyncio.gather</code>. Identical calls
                are deduplicated using canonical <code>(tool_name, args_hash)</code> keys.
              </p>
              <p>
                <strong className="text-cyan-300">4. Checkpointing & Recovery:</strong> Completed tasks
                are checkpointed after execution. When an error occurs (such as transient socket drop),
                state is restored from cache and retried without restarting the mission.
              </p>
              <p>
                <strong className="text-cyan-300">5. Verification & Human Oversight:</strong> Sensitive
                actions halt for human approval; final results undergo a multi-point audit.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsArchInfoOpen(false)}
                className="py-1.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
