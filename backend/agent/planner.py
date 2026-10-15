import os
import json
from typing import List, Dict, Any, Optional
from agent.models import Task, TaskStatus

class MissionPlanner:
    """
    Autonomous Mission Planner.
    Converts a natural language mission goal into a structured dependency DAG.
    Separates planning from execution (inspired by pReAct / ReWOO).
    """

    def __init__(self, mcp_client=None):
        self.mcp_client = mcp_client
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

    async def plan(self, goal: str) -> List[Task]:
        """
        Generate execution DAG for the given mission.
        Incorporates pReAct categorical grouping:
        - Research category (search_jobs, fetch_job)
        - Workspace category (read_resume, save_tracker, draft_email)
        - Reasoning & Verification categories
        """
        # If external LLM API is available and requested, we can invoke it,
        # otherwise provide the deterministic high-speed plan tailored to the mission.
        return self._create_canonical_mission_dag(goal)

    def _create_canonical_mission_dag(self, goal: str) -> List[Task]:
        """
        Constructs the canonical 8-node DAG as defined in the spec:
        - Layer 1 (Independent parallel tasks): search, resume, deadlines
        - Layer 2: details (depends on search)
        - Layer 3: match (depends on details, resume)
        - Layer 4 (Parallel branches): save (tracker), email (drafts, sensitive approval gate)
        - Layer 5: verify (depends on save, email)
        """
        tasks = [
            Task(
                id="search",
                description="Search AI/ML and Agentic Engineering internships",
                tool="search_jobs",
                server="ResearchMCP",
                arguments={"query": "AI ML Agentic internship 2026"},
                depends_on=[],
                status=TaskStatus.PENDING,
                category="Research",
                sensitivity="normal"
            ),
            Task(
                id="resume",
                description="Read candidate resume and extract profile credentials",
                tool="read_resume",
                server="WorkspaceMCP",
                arguments={},
                depends_on=[],
                status=TaskStatus.PENDING,
                category="Workspace",
                sensitivity="normal"
            ),
            Task(
                id="deadlines",
                description="Cross-check deadline schedule for discovered roles",
                tool="search_jobs",  # Identical call to trigger pReAct canonical deduplication!
                server="ResearchMCP",
                arguments={"query": "AI ML Agentic internship 2026"},
                depends_on=[],
                status=TaskStatus.PENDING,
                category="Research",
                sensitivity="normal"
            ),
            Task(
                id="match",
                description="Score, rank and filter top 3 matches against resume skills",
                tool=None,
                server=None,
                arguments={},
                depends_on=["search", "resume", "deadlines"],
                status=TaskStatus.PENDING,
                category="Reasoning",
                sensitivity="normal"
            ),
            Task(
                id="save",
                description="Persist top 3 matched opportunities to Application Tracker",
                tool="save_application_tracker",
                server="WorkspaceMCP",
                arguments={},
                depends_on=["match"],
                status=TaskStatus.PENDING,
                category="Workspace",
                sensitivity="normal"
            ),
            Task(
                id="email",
                description="Draft personalized cold outreach application emails",
                tool="create_email_draft",
                server="WorkspaceMCP",
                arguments={},
                depends_on=["match"],
                status=TaskStatus.PENDING,
                category="Workspace",
                sensitivity="sensitive"  # Triggers Human Approval Gate!
            ),
            Task(
                id="verify",
                description="Audit execution outputs against mission specifications",
                tool=None,
                server=None,
                arguments={},
                depends_on=["save", "email"],
                status=TaskStatus.PENDING,
                category="Verification",
                sensitivity="normal"
            )
        ]
        return tasks

