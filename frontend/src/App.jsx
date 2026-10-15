import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

import LandingScreen from './components/LandingScreen';
import PlanningScreen from './components/PlanningScreen';
import ExecutionView from './components/ExecutionView';
import CompletionScreen from './components/CompletionScreen';
import ApprovalModal from './components/ApprovalModal';

/*
  STATE MACHINE:
  idle → planning → building_dag → executing → (waiting_approval) → verifying → complete
  Any state → idle (via reset)
*/

const INITIAL_METRICS = {
  total_tasks: 7,
  completed_tasks: 0,
  tool_calls_proposed: 0,
  tool_calls_deduplicated: 0,
  tool_calls_executed: 0,
  parallel_batches_executed: 0,
  recovered_failures: 0,
  elapsed_time_seconds: 0,
  sequential_time_seconds: 0,
  latency_reduction_percent: 0,
};

const INITIAL_TASKS = [
  { id: 'search',    description: 'Search AI/ML internships',          tool: 'search_jobs',              category: 'Research',    status: 'PENDING', depends_on: [] },
  { id: 'resume',    description: 'Read candidate resume',              tool: 'read_resume',               category: 'Workspace',   status: 'PENDING', depends_on: [] },
  { id: 'deadlines', description: 'Cross-check deadlines (dedup)',      tool: 'search_jobs',              category: 'Research',    status: 'PENDING', depends_on: [] },
  { id: 'match',     description: 'Score and rank top 3 matches',       tool: null,                       category: 'Reasoning',   status: 'PENDING', depends_on: ['search', 'resume', 'deadlines'] },
  { id: 'save',      description: 'Save top 3 to application tracker',  tool: 'save_application_tracker', category: 'Workspace',   status: 'PENDING', depends_on: ['match'] },
  { id: 'email',     description: 'Draft personalized outreach emails', tool: 'create_email_draft',       category: 'Workspace',   status: 'PENDING', depends_on: ['match'] },
  { id: 'verify',    description: 'Audit results against specs',        tool: null,                       category: 'Verification',status: 'PENDING', depends_on: ['save', 'email'] },
];

export default function App() {
  // UI screen state
  const [screen, setScreen] = useState('idle'); // idle | planning | executing | complete

  // Mission data
  const [goal, setGoal] = useState('');
  const [missionId, setMissionId] = useState(null);
  const [status, setStatus] = useState('IDLE');       // backend mission status
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState([...INITIAL_TASKS]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState({ ...INITIAL_METRICS });
  const [pendingApproval, setPendingApproval] = useState(null);
  const [verificationReport, setVerificationReport] = useState(null);
  const [dagRevealed, setDagRevealed] = useState(false);

  const socketRef = useRef(null);

  /* ─── Reset everything ─────────────────────────────────────── */
  const reset = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setScreen('idle');
    setMissionId(null);
    setStatus('IDLE');
    setProgress(0);
    setTasks([...INITIAL_TASKS]);
    setEvents([]);
    setMetrics({ ...INITIAL_METRICS });
    setPendingApproval(null);
    setVerificationReport(null);
    setDagRevealed(false);
  }, []);

  /* ─── Handle streaming events from WebSocket ───────────────── */
  const handleEvent = useCallback((evt) => {
    if (evt.type === 'init') {
      const s = evt.state;
      setStatus(s.status);
      setProgress(s.progress || 0);
      if (s.tasks?.length) setTasks(s.tasks);
      if (s.metrics) setMetrics(s.metrics);
      if (s.pending_approval) setPendingApproval(s.pending_approval);
      return;
    }

    // Append to raw event log
    setEvents(prev => [...prev, evt]);

    // Progress
    if (evt.progress !== undefined) setProgress(evt.progress);

    // Task state changes
    if (evt.task_id) {
      setTasks(prev => prev.map(t => {
        if (t.id !== evt.task_id) return t;
        const next = { ...t };
        if (evt.type === 'task_started')    { next.status = 'RUNNING'; }
        if (evt.type === 'task_completed')  { next.status = 'SUCCESS'; next.duration_ms = evt.duration_ms; }
        if (evt.type === 'task_failed')     { next.status = 'FAILED'; next.error = evt.error; }
        if (evt.type === 'task_retry')      { next.status = 'RETRYING'; next.retry_count = (next.retry_count || 0) + 1; }
        if (evt.type === 'task_deduplicated') { next.status = 'SUCCESS'; next.deduplicated = true; }
        if (evt.type === 'approval_required') { next.status = 'WAITING_APPROVAL'; }
        return next;
      }));
    }

    // Deduplication metrics
    if (evt.type === 'task_deduplicated') {
      setMetrics(m => ({ ...m, tool_calls_deduplicated: m.tool_calls_deduplicated + 1 }));
    }

    // Approval gate
    if (evt.type === 'approval_required') {
      setStatus('WAITING_APPROVAL');
      setPendingApproval(evt.data);
    }
    if (evt.type === 'approval_granted' || evt.type === 'approval_rejected') {
      setPendingApproval(null);
      setStatus('EXECUTING');
    }

    // Verification
    if (evt.type === 'verification_completed') {
      setVerificationReport(evt.report);
    }

    // Mission complete
    if (evt.type === 'mission_completed') {
      setStatus('COMPLETED');
      setProgress(100);
      if (evt.metrics) setMetrics(evt.metrics);
      // Fire confetti then go to complete screen after short delay
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 }, colors: ['#4f8ef7', '#22c55e', '#f59e0b'] });
      setTimeout(() => setScreen('complete'), 1500);
    }

    // Update status from backend
    if (evt.type === 'mission_planned')       setStatus('EXECUTING');
    if (evt.type === 'verification_started')  setStatus('VERIFYING');
  }, []);

  /* ─── WebSocket connection ─────────────────────────────────── */
  const connectWS = useCallback((id) => {
    if (socketRef.current) socketRef.current.close();
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${proto}//${window.location.host}/ws/${id}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onmessage = (e) => {
      try { handleEvent(JSON.parse(e.data)); } catch {}
    };

    ws.onerror = () => {
      // Fallback to SSE
      const es = new EventSource(`/mission/${id}/events`);
      es.onmessage = (ev) => {
        try { handleEvent(JSON.parse(ev.data)); } catch {}
      };
    };
  }, [handleEvent]);

  /* ─── Start mission ─────────────────────────────────────────── */
  const executeMission = useCallback(async (goalText, simulateFailure) => {
    setGoal(goalText);
    setScreen('planning');
    setTasks([...INITIAL_TASKS]);
    setEvents([]);
    setMetrics({ ...INITIAL_METRICS });
    setProgress(0);
    setStatus('PLANNING');
    setDagRevealed(false);
    setPendingApproval(null);
    setVerificationReport(null);

    try {
      const res = await fetch('/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalText, simulate_failure: simulateFailure, auto_approve: false }),
      });
      if (!res.ok) throw new Error('Failed to start mission');
      const data = await res.json();
      setMissionId(data.mission_id);
      // Connect WS immediately — backend already running
      connectWS(data.mission_id);
    } catch (err) {
      console.error(err);
      setScreen('idle');
      alert('Could not connect to backend. Make sure the server is running on port 8000.');
    }
  }, [connectWS]);

  /* ─── Planning complete callback ────────────────────────────── */
  const handlePlanReady = useCallback(() => {
    setScreen('executing');
    setDagRevealed(true);
  }, []);

  /* ─── Approval handlers ─────────────────────────────────────── */
  const handleApprove = useCallback(async () => {
    if (!missionId) return;
    try {
      await fetch(`/mission/${missionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      setPendingApproval(null);
    } catch (err) { console.error(err); }
  }, [missionId]);

  const handleReject = useCallback(async () => {
    if (!missionId) return;
    try {
      await fetch(`/mission/${missionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', notes: 'Rejected by user' }),
      });
      setPendingApproval(null);
    } catch (err) { console.error(err); }
  }, [missionId]);

  /* ─── Cleanup on unmount ────────────────────────────────────── */
  useEffect(() => () => { socketRef.current?.close(); }, []);

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <>
      {screen === 'idle' && (
        <LandingScreen onExecute={executeMission} />
      )}

      {screen === 'planning' && (
        <PlanningScreen goal={goal} onPlanReady={handlePlanReady} />
      )}

      {screen === 'executing' && (
        <ExecutionView
          status={status}
          progress={progress}
          tasks={tasks}
          events={events}
          metrics={metrics}
          goal={goal}
          missionId={missionId}
          dagRevealed={dagRevealed}
          onGoToDone={() => setScreen('complete')}
        />
      )}

      {screen === 'complete' && (
        <CompletionScreen
          metrics={metrics}
          verificationReport={verificationReport}
          goal={goal}
          onViewExecution={() => setScreen('executing')}
          onReset={reset}
        />
      )}

      {/* Human Approval Modal — overlays any screen */}
      {pendingApproval && (
        <ApprovalModal
          approvalData={pendingApproval}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}
