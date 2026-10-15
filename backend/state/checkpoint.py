import json
import os
import copy
from typing import Dict, Any, Optional

STATE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
CHECKPOINT_FILE = os.path.join(STATE_DIR, "checkpoint.json")

class CheckpointManager:
    """
    State Checkpointing & Recovery Engine.
    Persists successful task intermediate outputs and allows restoring to a checkpoint
    when a transient failure happens, avoiding full-mission restarts.
    """

    def __init__(self, mission_id: str):
        self.mission_id = mission_id
        self.completed_tasks: Dict[str, Any] = {}
        self.history: list = []

    def save(self, task_id: str, result: Any) -> Dict[str, Any]:
        """Save a task checkpoint"""
        self.completed_tasks[task_id] = copy.deepcopy(result)
        snapshot = {
            "mission_id": self.mission_id,
            "completed_tasks": self.completed_tasks,
            "saved_task": task_id
        }
        self.history.append(f"Saved checkpoint after task '{task_id}'")
        
        # Persist checkpoint to disk
        try:
            with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "mission_id": self.mission_id,
                    "completed_tasks": self.completed_tasks
                }, f, indent=2)
        except Exception as e:
            print(f"Warning: Failed to persist checkpoint to disk: {e}")

        return snapshot

    def get(self, task_id: str) -> Optional[Any]:
        """Retrieve cached output of a completed task"""
        return self.completed_tasks.get(task_id)

    def restore(self) -> Dict[str, Any]:
        """Restore latest checkpoint state"""
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.completed_tasks = data.get("completed_tasks", {})
            except Exception as e:
                print(f"Warning: Failed to read checkpoint from disk: {e}")
        return {
            "mission_id": self.mission_id,
            "completed_tasks": self.completed_tasks
        }

    def clear(self):
        """Clear state for a fresh mission run"""
        self.completed_tasks = {}
        self.history = []
        if os.path.exists(CHECKPOINT_FILE):
            try:
                os.remove(CHECKPOINT_FILE)
            except Exception:
                pass
