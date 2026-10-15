from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    READY = "READY"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    SKIPPED = "SKIPPED"

class MissionStatus(str, Enum):
    IDLE = "IDLE"
    PLANNING = "PLANNING"
    EXECUTING = "EXECUTING"
    WAITING_APPROVAL = "WAITING_APPROVAL"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Task(BaseModel):
    id: str
    description: str
    tool: Optional[str] = None
    server: Optional[str] = None
    arguments: Dict[str, Any] = Field(default_factory=dict)
    depends_on: List[str] = Field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 2
    sensitivity: str = "normal"  # "normal" or "sensitive"
    category: str = "General"    # "Research", "Workspace", "Reasoning", "Verification"
    duration_ms: Optional[float] = None

class MissionRequest(BaseModel):
    goal: str
    simulate_failure: bool = True
    auto_approve: bool = False

class ApprovalRequest(BaseModel):
    action: str = "approve"  # "approve" or "reject"
    notes: Optional[str] = None

class MissionMetrics(BaseModel):
    total_tasks: int = 0
    completed_tasks: int = 0
    tool_calls_proposed: int = 0
    tool_calls_deduplicated: int = 0
    tool_calls_executed: int = 0
    parallel_batches_executed: int = 0
    recovered_failures: int = 0
    elapsed_time_seconds: float = 0.0
    sequential_time_seconds: float = 0.0
    latency_reduction_percent: float = 0.0

class VerificationItem(BaseModel):
    criterion: str
    passed: bool
    details: str

class VerificationReport(BaseModel):
    verified: bool
    score: str
    checks: List[VerificationItem] = Field(default_factory=list)
    summary: str
