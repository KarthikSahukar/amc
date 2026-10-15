# OperatorOS — Frontend

> **Visual Autonomous Mission Execution Engine** (Inspired by pReAct)  
> Built for the Hackathon Build Specification

---

## 🚀 Key Features Implemented

1. **Centerpiece Live Execution Graph (`ExecutionGraph.jsx` & `CustomTaskNode.jsx`)**:
   - Built with **React Flow** (`@xyflow/react`).
   - Visualizes the full DAG:
     - `🎯 MISSION` ➔ `🧠 PLANNER`
     - Concurrent Batch 1: `🔎 SEARCH JOBS`, `📄 READ RESUME`, `⏰ FIND DEADLINES`
     - Dependency unlock: `📑 FETCH DETAILS` (unlocks when `search` succeeds)
     - Dependency merge: `🧠 MATCH & RANK` (unlocks when both `details` and `resume` succeed)
     - Concurrent Batch 2: `📊 SAVE TRACKER` & `✉️ DRAFT EMAILS`
     - `🔍 INDEPENDENT VERIFIER` (verifies 5/5 requirements)
     - `⚠️ HUMAN APPROVAL` (sensitive action gate)
     - `✅ MISSION COMPLETE`
   - Node status states: `PENDING`, `READY`, `RUNNING` (pulsing glow & animation), `SUCCESS`, `FAILED` (with recoverable error badge), `RETRYING`, `WAITING_APPROVAL`, `SKIPPED`.
   - Node Inspector Drawer: Click any node to see tool name, arguments, inputs, outputs, checkpoint status, and dependencies.

2. **Mission Control Panel (`MissionPanel.jsx`)**:
   - Natural language mission prompt input with a 1-click **"Load Demo Prompt"** button.
   - Status badge and dynamic percentage progress bar.
   - Real-time metrics tracking:
     - Total & Completed Tasks
     - Tool Calls count
     - Parallel Executions counter
     - Recovered Failures count
     - Deduplication stats (e.g. 6 proposed ➔ 2 duplicates filtered ➔ 4 executed)
     - Checkpoint snapshot tracker (`checkpoint.json`).

3. **Live Tool Trace (`ToolTrace.jsx`)**:
   - Real-time terminal activity stream with timestamps, icons, and categories.
   - Filter tabs: `ALL`, `TOOLS`, `PARALLEL`, `RECOVERY`.
   - Features 1-click copy and auto-scroll locking.

4. **Human-in-the-Loop Approval Gate (`ApprovalPanel.jsx`)**:
   - Pops up during `WAITING_APPROVAL` with `⚠️ HUMAN APPROVAL REQUIRED`.
   - Allows reviewing the 3 generated email drafts before sending.
   - Triggers `POST /mission/{id}/approve` or `POST /mission/{id}/reject`.

5. **Artifacts & Verification Modal (`VerificationModal.jsx`)**:
   - **Application Tracker**: Interactive table of ranked opportunities, match scores, deadlines, and requirements.
   - **Email Drafts**: Fully formatted, personalized outreach letters with 1-click copy.
   - **Independent Verification Checklist**: 5/5 criteria verified.
   - **Checkpoint History**: JSON snapshot view of `checkpoint.json` demonstrating fault tolerance.

6. **Dual-Mode Backend Connector & Rehearsal Simulator (`api.js` & `mockMissionEngine.js`)**:
   - **Live Backend Mode**: Automatically connects to the FastAPI backend (`http://localhost:8000`) via REST and WebSockets/SSE (`/ws/{id}` or `/mission/{id}/events`).
   - **Rehearsal Demo Mode**: A deterministic, full-fidelity simulator executing all 7 scenes from the hackathon demo script with the intentional recoverable error and checkpoint restore!

---

## 🛠️ How to Run

```bash
# Navigate to frontend
cd frontend

# Install dependencies (already installed)
npm install

# Run the dev server
npm run dev
```

Open **`http://localhost:5173/`** in your browser.
