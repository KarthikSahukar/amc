import os
import sys

# Ensure backend directory is in sys.path so 'mcp', 'agent', and 'state' packages resolve
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import uuid
import json
import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from mcp.client import MCPClient
from state.checkpoint import CheckpointManager
from agent.models import MissionRequest, ApprovalRequest, TaskStatus
from agent.planner import MissionPlanner
from agent.executor import TaskExecutor
from agent.verifier import MissionVerifier
from agent.scheduler import MissionScheduler

app = FastAPI(
    title="OperatorOS API",
    description="Autonomous Mission Operator Engine inspired by pReAct",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory mission registry
active_missions: Dict[str, MissionScheduler] = {}
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "data"))

@app.get("/")
def read_root():
    return {
        "system": "OperatorOS Autonomous Mission Engine",
        "status": "ONLINE",
        "architecture": "pReAct-inspired DAG with MCP Tool Orchestration",
        "docs_url": "/docs"
    }

@app.get("/mcp/tools")
def get_mcp_tools():
    """Discover all available tools across connected MCP servers"""
    client = MCPClient()
    return {
        "status": "success",
        "servers": ["ResearchMCP", "WorkspaceMCP"],
        "tools": client.list_tools()
    }

@app.post("/mission")
async def start_mission(req: MissionRequest):
    """
    POST /mission
    Initializes and starts a new autonomous mission.
    Generates DAG, sets up MCP client, checkpoint manager, and scheduler.
    """
    mission_id = f"mission_{uuid.uuid4().hex[:8]}"
    
    # Initialize components
    mcp_client = MCPClient(simulate_failure=req.simulate_failure)
    checkpoint_mgr = CheckpointManager(mission_id=mission_id)
    checkpoint_mgr.clear()
    
    planner = MissionPlanner(mcp_client=mcp_client)
    tasks = await planner.plan(req.goal)
    
    executor = TaskExecutor(mcp_client=mcp_client, checkpoint_mgr=checkpoint_mgr)
    verifier = MissionVerifier(data_dir=DATA_DIR)
    
    scheduler = MissionScheduler(
        mission_id=mission_id,
        tasks=tasks,
        executor=executor,
        verifier=verifier,
        checkpoint_mgr=checkpoint_mgr,
        auto_approve=req.auto_approve
    )
    
    active_missions[mission_id] = scheduler
    
    # Launch mission asynchronously in the background
    asyncio.create_task(scheduler.run())
    
    return {
        "mission_id": mission_id,
        "status": "STARTED",
        "task_count": len(tasks),
        "message": "Mission initialized and execution graph constructed."
    }

@app.get("/mission/{mission_id}")
def get_mission_state(mission_id: str):
    """GET /mission/{mission_id} - Returns complete current mission state"""
    scheduler = active_missions.get(mission_id)
    if not scheduler:
        raise HTTPException(status_code=404, detail="Mission not found")
    return scheduler.get_state()

@app.post("/mission/{mission_id}/approve")
def approve_mission_action(mission_id: str, req: ApprovalRequest):
    """POST /mission/{mission_id}/approve - Approves pending sensitive action"""
    scheduler = active_missions.get(mission_id)
    if not scheduler:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    success = scheduler.submit_approval_decision(approved=True, reason=req.notes)
    if not success:
        raise HTTPException(status_code=400, detail="No pending human approval request for this mission.")
    
    return {"status": "APPROVED", "mission_id": mission_id}

@app.post("/mission/{mission_id}/reject")
def reject_mission_action(mission_id: str, req: ApprovalRequest):
    """POST /mission/{mission_id}/reject - Rejects pending sensitive action"""
    scheduler = active_missions.get(mission_id)
    if not scheduler:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    success = scheduler.submit_approval_decision(approved=False, reason=req.notes or "Cancelled by user")
    if not success:
        raise HTTPException(status_code=400, detail="No pending human approval request for this mission.")
    
    return {"status": "REJECTED", "mission_id": mission_id}

@app.get("/mission/{mission_id}/events")
async def sse_mission_events(mission_id: str):
    """GET /mission/{mission_id}/events - Server-Sent Events (SSE) stream"""
    scheduler = active_missions.get(mission_id)
    if not scheduler:
        raise HTTPException(status_code=404, detail="Mission not found")

    async def event_generator():
        q = scheduler.subscribe()
        try:
            # Yield initial snapshot
            yield f"data: {json.dumps({'type': 'init', 'state': scheduler.get_state()})}\n\n"
            while True:
                event = await q.get()
                yield f"data: {json.dumps(event)}\n\n"
                if event.get("type") in ("mission_completed", "mission_failed"):
                    break
        except asyncio.CancelledError:
            pass
        finally:
            scheduler.unsubscribe(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.websocket("/ws/{mission_id}")
async def websocket_mission_endpoint(websocket: WebSocket, mission_id: str):
    """WS /ws/{mission_id} - Real-time WebSocket connection for live telemetry"""
    await websocket.accept()
    scheduler = active_missions.get(mission_id)
    if not scheduler:
        await websocket.send_json({"type": "error", "message": "Mission not found"})
        await websocket.close()
        return

    q = scheduler.subscribe()
    try:
        # Send initial snapshot immediately
        await websocket.send_json({"type": "init", "state": scheduler.get_state()})
        
        while True:
            event = await q.get()
            await websocket.send_json(event)
            if event.get("type") in ("mission_completed", "mission_failed"):
                # Keep socket alive a moment so frontend receives final frames
                await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        scheduler.unsubscribe(q)

@app.get("/workspace/artifacts")
def get_artifacts():
    """Retrieve generated tracker file and email drafts for demonstration"""
    tracker_path = os.path.join(DATA_DIR, "applications.json")
    drafts_path = os.path.join(DATA_DIR, "drafts.json")
    
    tracker = {}
    if os.path.exists(tracker_path):
        try:
            with open(tracker_path, "r", encoding="utf-8") as f:
                tracker = json.load(f)
        except Exception:
            pass
            
    drafts = []
    if os.path.exists(drafts_path):
        try:
            with open(drafts_path, "r", encoding="utf-8") as f:
                drafts = json.load(f)
        except Exception:
            pass

    return {
        "tracker": tracker,
        "drafts": drafts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
