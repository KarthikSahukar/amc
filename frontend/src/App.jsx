import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import MissionPanel from './components/MissionPanel';
import ExecutionGraph from './components/ExecutionGraph';
import ToolTrace from './components/ToolTrace';
import ApprovalPanel from './components/ApprovalPanel';
import TaskDetailDrawer from './components/TaskDetailDrawer';
import VerificationModal from './components/VerificationModal';

import { 
  INITIAL_MISSION_TEXT, 
  INITIAL_DAG_NODES, 
  INITIAL_DAG_EDGES,
  MOCK_APPLICATIONS,
  MOCK_EMAIL_DRAFTS,
  MOCK_VERIFICATION_ITEMS
} from './services/mockMissionEngine';

import { apiClient } from './services/api';

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_DAG_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_DAG_EDGES);

  const [missionGoal, setMissionGoal] = useState(INITIAL_MISSION_TEXT);
  const [missionStatus, setMissionStatus] = useState('IDLE'); // IDLE, PLANNING, RUNNING, WAITING_APPROVAL, COMPLETED, FAILED
  const [progress, setProgress] = useState(0);

  const [metrics, setMetrics] = useState({
    totalTasks: 9,
    completedTasks: 0,
    toolCalls: 0,
    parallelCalls: 0,
    recoveredFailures: 0,
    toolCallsProposed: 0,
    duplicatesRemoved: 0
  });

  const [checkpointInfo, setCheckpointInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showApprovalGate, setShowApprovalGate] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // Backend integration state
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendUrl, setBackendUrl] = useState(apiClient.getBaseUrl());
  const [activeMissionId, setActiveMissionId] = useState(null);

  const simTimeoutsRef = useRef([]);

  // Clear running timeouts
  const clearSimTimeouts = () => {
    simTimeoutsRef.current.forEach((t) => clearTimeout(t));
    simTimeoutsRef.current = [];
  };

  // Check backend health periodically
  useEffect(() => {
    let isMounted = true;
    const checkConn = async () => {
      const ok = await apiClient.checkHealth();
      if (isMounted) setIsBackendConnected(ok);
    };
    checkConn();
    const interval = setInterval(checkConn, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendUrl]);

  const addLog = useCallback((text, emoji = '⚡', type = 'info', tool = null, details = null, category = 'system') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        text,
        emoji,
        type,
        tool,
        details,
        category
      }
    ]);
  }, []);

  const updateNodeState = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updates
            }
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  const updateEdgeStyle = useCallback((sourceId, targetId, isActive) => {
    setEdges((eds) =>
      eds.map((e) => {
        if (e.source === sourceId && e.target === targetId) {
          return {
            ...e,
            animated: isActive,
            style: {
              ...e.style,
              stroke: isActive ? '#38bdf8' : '#334155',
              strokeWidth: isActive ? 2.5 : 1.5
            }
          };
        }
        return e;
      })
    );
  }, [setEdges]);

  // Reset function
  const handleReset = () => {
    clearSimTimeouts();
    apiClient.disconnectEvents();
    setNodes(INITIAL_DAG_NODES);
    setEdges(INITIAL_DAG_EDGES);
    setMissionStatus('IDLE');
    setProgress(0);
    setMetrics({
      totalTasks: 9,
      completedTasks: 0,
      toolCalls: 0,
      parallelCalls: 0,
      recoveredFailures: 0,
      toolCallsProposed: 0,
      duplicatesRemoved: 0
    });
    setCheckpointInfo(null);
    setLogs([]);
    setSelectedNode(null);
    setShowApprovalGate(false);
    setShowResultsModal(false);
    setActiveMissionId(null);
  };

  /**
   * Interactive Simulator: Accurately replicates the 7 Hackathon Demo Scenes
   * (Pages 27-29 of the Hackathon Build Specification)
   */
  const runSimulation = () => {
    handleReset();
    clearSimTimeouts();

    setMissionStatus('PLANNING');
    setProgress(5);
    addLog('OperatorOS initializing mission...', '🎯', 'info', null, null, 'system');
    addLog('Planner analyzing goal & dependencies with pReAct drafting...', '🧠', 'info', 'llm_plan', null, 'system');
    updateNodeState('mission', { status: 'SUCCESS' });
    updateNodeState('planner', { status: 'RUNNING' });
    updateEdgeStyle('mission', 'planner', true);

    const scheduleStep = (delay, fn) => {
      const tid = setTimeout(fn, delay);
      simTimeoutsRef.current.push(tid);
    };

    // SCENE 1: Planning complete, 6 tasks identified, 3 independent
    scheduleStep(1400, () => {
      setMissionStatus('RUNNING');
      setProgress(15);
      updateNodeState('planner', { 
        status: 'SUCCESS', 
        resultPreview: '6 tasks generated (3 independent parallel roots)' 
      });
      addLog('Planner created 6 tasks in dependency DAG', '🧠', 'success', null, null, 'system');
      addLog('pReAct deduplication: 6 tool calls proposed, 2 duplicates removed, 4 unique calls queued', '🔍', 'info', null, null, 'system');
      
      setMetrics((m) => ({
        ...m,
        toolCallsProposed: 6,
        duplicatesRemoved: 2,
        completedTasks: 1
      }));

      // SCENE 2: Parallel execution (SEARCH, RESUME, DEADLINES simultaneously)
      addLog('Executing 3 independent tasks concurrently (Batch 1)', '⚡', 'parallel', null, null, 'parallel');
      
      updateNodeState('search', { status: 'RUNNING' });
      updateNodeState('resume', { status: 'RUNNING' });
      updateNodeState('deadlines', { status: 'RUNNING' });

      updateEdgeStyle('planner', 'search', true);
      updateEdgeStyle('planner', 'resume', true);
      updateEdgeStyle('planner', 'deadlines', true);

      addLog('search_jobs("AI ML internships")', '🔎', 'tool', 'search_jobs', { query: 'AI ML internships 2026' }, 'mcp');
      addLog('read_resume()', '📄', 'tool', 'read_resume', { path: 'workspace/resume.txt' }, 'mcp');
      addLog('find_deadlines()', '⏰', 'tool', 'find_deadlines', { filter: 'active_window' }, 'mcp');

      setMetrics((m) => ({ ...m, toolCalls: m.toolCalls + 3, parallelCalls: m.parallelCalls + 3 }));
    });

    // Resume parsed & deadlines found
    scheduleStep(3200, () => {
      updateNodeState('resume', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: 'Alex Chen profile parsed: PyTorch, Agents, MCP' 
      });
      updateNodeState('deadlines', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: 'All 3 deadlines mapped between Nov 30 - Dec 15' 
      });

      addLog('Resume parsed (12 technical capabilities extracted)', '✓', 'success', 'read_resume', null, 'mcp');
      addLog('Deadlines catalogued for Q4 cycle', '✓', 'success', 'find_deadlines', null, 'mcp');

      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 2 }));
      setProgress(35);
    });

    // Search jobs completes -> SCENE 3: Dependency Unlock (DETAILS unlocks)
    scheduleStep(4200, () => {
      updateNodeState('search', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: '5 matching AI/ML positions found' 
      });
      addLog('5 job opportunities found across DeepMind, Anthropic, OpenAI', '✓', 'success', 'search_jobs', null, 'mcp');

      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
      setProgress(48);

      // DETAILS node unlocked!
      addLog('Dependency satisfied: Unlocking FETCH DETAILS task', '🔓', 'info', null, null, 'system');
      updateNodeState('details', { status: 'RUNNING' });
      updateEdgeStyle('search', 'details', true);
      addLog('fetch_job(job_ids=[1, 2, 3, 4, 5])', '📑', 'tool', 'fetch_job', { count: 5 }, 'mcp');
      setMetrics((m) => ({ ...m, toolCalls: m.toolCalls + 1 }));
    });

    // DETAILS completes -> MATCHING unlocks
    scheduleStep(5800, () => {
      updateNodeState('details', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: 'Complete role requirements & team specs acquired' 
      });
      addLog('Deep specifications fetched for 5 positions', '✓', 'success', 'fetch_job', null, 'mcp');
      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
      setProgress(60);

      // MATCHING node unlocked (requires details AND resume)
      addLog('All upstream dependencies satisfied: MATCH task unlocked', '🔓', 'info', null, null, 'system');
      updateNodeState('matching', { status: 'RUNNING' });
      updateEdgeStyle('details', 'matching', true);
      updateEdgeStyle('resume', 'matching', true);
      addLog('Matching candidates against resume...', '🧠', 'tool', 'match_candidates', null, 'system');
    });

    // MATCHING completes -> unlocks parallel SAVE + EMAIL
    scheduleStep(7400, () => {
      updateNodeState('matching', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: 'Top 3 selected: DeepMind (96%), Anthropic (94%), OpenAI (91%)' 
      });
      addLog('Match complete: 3 top opportunities shortlisted', '✓', 'success', 'match_candidates', null, 'system');
      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
      setProgress(72);

      // Parallel Batch 2: SAVE TRACKER & DRAFT EMAILS
      addLog('Executing 2 independent downstream tasks concurrently (Batch 2)', '⚡', 'parallel', null, null, 'parallel');
      updateNodeState('save', { status: 'RUNNING' });
      updateNodeState('email', { status: 'RUNNING' });
      updateEdgeStyle('matching', 'save', true);
      updateEdgeStyle('matching', 'email', true);

      addLog('save_application_tracker()', '📊', 'tool', 'save_application_tracker', { file: 'applications.json' }, 'mcp');
      addLog('create_email_draft(count=3)', '✉️', 'tool', 'create_email_draft', { recipients: 3 }, 'mcp');

      setMetrics((m) => ({ ...m, toolCalls: m.toolCalls + 2, parallelCalls: m.parallelCalls + 2 }));
    });

    // SCENE 4: Failure Demo & Checkpoint Recovery (Section 20)
    scheduleStep(8900, () => {
      // SAVE TRACKER fails intentionally once
      updateNodeState('save', { 
        status: 'FAILED', 
        errorPreview: 'Temporary workspace connection error' 
      });
      addLog('save_application_tracker() failed: Temporary workspace connection error', '⚠', 'error', 'save_application_tracker', null, 'recovery');
      
      // Email succeeds meanwhile!
      updateNodeState('email', { 
        status: 'SUCCESS', 
        hasCheckpoint: true,
        resultPreview: '3 customized emails drafted with candidate specifics' 
      });
      addLog('3 customized email drafts created successfully', '✓', 'success', 'create_email_draft', null, 'mcp');
      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
      setProgress(82);

      // Checkpoint recovery triggered immediately
      scheduleStep(800, () => {
        addLog('Restoring checkpoint: Rolling back to last verified task snapshot', '💾', 'checkpoint', null, { checkpoint_id: 'chk_9981' }, 'recovery');
        setCheckpointInfo({
          id: 'chk_9981',
          tasksSaved: 5,
          timestamp: new Date().toLocaleTimeString()
        });

        updateNodeState('save', { 
          status: 'RETRYING', 
          retries: 1,
          errorPreview: null 
        });
        addLog('Retrying save_application_tracker() (Attempt 1/2)...', '🔄', 'retry', 'save_application_tracker', null, 'recovery');
      });

      // Save succeeds on retry!
      scheduleStep(2400, () => {
        updateNodeState('save', { 
          status: 'SUCCESS', 
          hasCheckpoint: true,
          retries: 1,
          resultPreview: '3 entries written to workspace/applications.json' 
        });
        addLog('Save successful: workspace/applications.json persisted', '✓', 'success', 'save_application_tracker', null, 'recovery');
        
        setMetrics((m) => ({ 
          ...m, 
          completedTasks: m.completedTasks + 1,
          recoveredFailures: m.recoveredFailures + 1,
          toolCalls: m.toolCalls + 1
        }));
        setProgress(90);

        // SCENE 5: Verification (Section 21)
        addLog('Starting independent mission verification loop...', '🔍', 'info', 'verify_mission', null, 'system');
        updateNodeState('verify', { status: 'RUNNING' });
        updateEdgeStyle('save', 'verify', true);
        updateEdgeStyle('email', 'verify', true);

        scheduleStep(1600, () => {
          updateNodeState('verify', { 
            status: 'SUCCESS', 
            resultPreview: '5/5 requirements verified (Zero missing fields)' 
          });
          addLog('Independent Verification: 5/5 opportunities found ✓', '✓', 'success', 'verifier', null, 'system');
          addLog('Independent Verification: 3/3 tracker records saved ✓', '✓', 'success', 'verifier', null, 'system');
          addLog('Independent Verification: 3/3 email drafts generated ✓', '✓', 'success', 'verifier', null, 'system');
          addLog('MISSION VERIFIED: 100% compliance', '🛡️', 'success', 'verifier', null, 'system');

          setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
          setProgress(95);

          // SCENE 6: Human Approval Gate (Section 22)
          updateNodeState('approve', { status: 'WAITING_APPROVAL' });
          updateEdgeStyle('verify', 'approve', true);
          setMissionStatus('WAITING_APPROVAL');
          setShowApprovalGate(true);
          addLog('⚠ HUMAN APPROVAL REQUIRED: Sensitive action gate active before sending emails', '⚠', 'approval', null, null, 'system');
        });
      });
    });
  };

  /**
   * Called when user approves email drafts
   */
  const handleApproveAction = async () => {
    setShowApprovalGate(false);
    addLog('Human approval received: Action authorized by operator', '✅', 'approval', null, null, 'system');
    
    if (activeMissionId && isBackendConnected) {
      await apiClient.approveMission(activeMissionId);
    }

    updateNodeState('approve', { 
      status: 'SUCCESS', 
      resultPreview: 'Human approval granted by operator' 
    });
    updateEdgeStyle('approve', 'done', true);
    updateNodeState('done', { status: 'RUNNING' });

    setTimeout(() => {
      updateNodeState('done', { 
        status: 'SUCCESS', 
        resultPreview: 'Mission Complete: 3 applications tracked & approved' 
      });
      setMissionStatus('COMPLETED');
      setProgress(100);
      setMetrics((m) => ({ ...m, completedTasks: m.completedTasks + 1 }));
      addLog('MISSION COMPLETE: All objectives fulfilled with verified recovery.', '🏆', 'success', null, null, 'system');

      // Trigger victory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Automatically show outputs modal after brief moment
      setTimeout(() => setShowResultsModal(true), 800);
    }, 1000);
  };

  const handleRejectAction = async () => {
    setShowApprovalGate(false);
    addLog('Human operator rejected email dispatch. Safe termination triggered.', '🚫', 'approval', null, null, 'system');

    if (activeMissionId && isBackendConnected) {
      await apiClient.rejectMission(activeMissionId);
    }

    updateNodeState('approve', { 
      status: 'SKIPPED', 
      resultPreview: 'Rejected by operator: Emails discarded safely' 
    });
    updateNodeState('done', { 
      status: 'SUCCESS', 
      resultPreview: 'Mission ended safely without dispatch' 
    });
    setMissionStatus('COMPLETED');
    setProgress(100);
  };

  /**
   * Start Mission button handler
   * Connects to real backend if available, or runs high-fidelity simulator
   */
  const handleStartMission = async () => {
    if (isBackendConnected) {
      handleReset();
      setMissionStatus('RUNNING');
      addLog(`Sending mission to FastAPI backend at ${backendUrl}...`, '🚀', 'info');
      try {
        const res = await apiClient.startMission(missionGoal);
        const missionId = res.mission_id || 'live-mission';
        setActiveMissionId(missionId);
        addLog(`Backend accepted mission: ID ${missionId}`, '✓', 'success');

        // Connect WebSocket / SSE
        apiClient.connectEvents(
          missionId,
          (event) => {
            // Live backend event handling
            if (event.type === 'task_started') {
              updateNodeState(event.task_id, { status: 'RUNNING' });
              addLog(`Task started: ${event.task_id} (${event.tool || 'internal'})`, '⚡', 'tool');
            } else if (event.type === 'task_completed') {
              updateNodeState(event.task_id, { status: 'SUCCESS', resultPreview: event.result });
              addLog(`Task completed: ${event.task_id}`, '✓', 'success');
            } else if (event.type === 'task_failed') {
              updateNodeState(event.task_id, { status: 'FAILED', errorPreview: event.error });
              addLog(`Task failed: ${event.task_id} (${event.error})`, '⚠', 'error');
            } else if (event.type === 'task_retry') {
              updateNodeState(event.task_id, { status: 'RETRYING' });
              addLog(`Retrying task: ${event.task_id}`, '🔄', 'retry');
            } else if (event.type === 'approval_required') {
              updateNodeState(event.task_id || 'approve', { status: 'WAITING_APPROVAL' });
              setMissionStatus('WAITING_APPROVAL');
              setShowApprovalGate(true);
            } else if (event.type === 'mission_completed') {
              setMissionStatus('COMPLETED');
              setProgress(100);
              confetti();
            }
          },
          (err) => {
            console.warn('Backend stream closed, keeping current state');
          }
        );
      } catch (err) {
        addLog(`Error connecting to backend: ${err.message}. Falling back to simulation.`, '⚠', 'error');
        runSimulation();
      }
    } else {
      runSimulation();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        missionStatus={missionStatus}
        isBackendConnected={isBackendConnected}
        backendUrl={backendUrl}
        onUpdateBackendUrl={(url) => {
          apiClient.setBaseUrl(url);
          setBackendUrl(url);
        }}
        onStartDemo={runSimulation}
        onReset={handleReset}
        onOpenResults={() => setShowResultsModal(true)}
        hasResults={progress > 60 || missionStatus === 'COMPLETED'}
        isRunning={missionStatus === 'RUNNING' || missionStatus === 'PLANNING'}
      />

      {/* Main 3-Column Execution Interface */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Mission Panel */}
        <MissionPanel
          missionGoal={missionGoal}
          onMissionGoalChange={setMissionGoal}
          onStartMission={handleStartMission}
          missionStatus={missionStatus}
          progress={progress}
          metrics={metrics}
          isRunning={missionStatus === 'RUNNING' || missionStatus === 'PLANNING'}
          checkpointInfo={checkpointInfo}
        />

        {/* Center: Live DAG Execution Graph */}
        <main className="flex-1 relative h-full">
          <ExecutionGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <TaskDetailDrawer
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}

          {/* Floating Human Approval Gate */}
          <ApprovalPanel
            isOpen={showApprovalGate}
            onApprove={handleApproveAction}
            onReject={handleRejectAction}
            drafts={MOCK_EMAIL_DRAFTS}
          />
        </main>

        {/* Right: Live Tool Trace */}
        <ToolTrace
          logs={logs}
          onClear={() => setLogs([])}
        />
      </div>

      {/* Verification & Results Inspection Modal */}
      <VerificationModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        metrics={metrics}
        applications={MOCK_APPLICATIONS}
        drafts={MOCK_EMAIL_DRAFTS}
        verificationItems={MOCK_VERIFICATION_ITEMS}
      />
    </div>
  );
}
