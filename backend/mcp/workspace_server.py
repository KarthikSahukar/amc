import json
import os
from typing import Dict, Any, List

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
RESUME_FILE = os.path.join(DATA_DIR, "resume.txt")
APPLICATIONS_FILE = os.path.join(DATA_DIR, "applications.json")
DRAFTS_FILE = os.path.join(DATA_DIR, "drafts.json")

class WorkspaceMCPServer:
    """
    Workspace MCP Server
    Exposes workspace and file operations:
    - read_resume()
    - save_application_tracker(applications)  (includes controlled transient failure for recovery demo)
    - create_email_draft(email)
    """

    def __init__(self, simulate_failure_once: bool = True):
        self.server_name = "WorkspaceMCP"
        self.simulate_failure_once = simulate_failure_once
        self._has_failed_once = False

    def reset_failure_simulation(self):
        self._has_failed_once = False

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "read_resume",
                "description": "Read and return the candidate's local resume content.",
                "server": self.server_name,
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "save_application_tracker",
                "description": "Save matched internship applications to the application tracking spreadsheet/JSON.",
                "server": self.server_name,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "applications": {
                            "type": "array",
                            "items": {"type": "object"},
                            "description": "List of shortlisted job application objects to save"
                        }
                    },
                    "required": ["applications"]
                }
            },
            {
                "name": "create_email_draft",
                "description": "Generate a personalized cold application email draft for a specific role and company.",
                "server": self.server_name,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "company": {"type": "string", "description": "Target company name"},
                        "role": {"type": "string", "description": "Internship role title"},
                        "contact_email": {"type": "string", "description": "Recipient email or hiring manager email"},
                        "subject": {"type": "string", "description": "Email subject line"},
                        "body": {"type": "string", "description": "Personalized email pitch"}
                    },
                    "required": ["company", "role"]
                }
            }
        ]

    async def read_resume(self) -> Dict[str, Any]:
        """Read the candidate's resume from disk"""
        if not os.path.exists(RESUME_FILE):
            return {"error": "resume.txt not found", "content": ""}
        
        with open(RESUME_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        return {
            "status": "success",
            "candidate_name": "Alex Kumar",
            "degree": "B.Tech in Computer Science & Engineering (3rd Year)",
            "key_skills": ["PyTorch", "FastAPI", "Agentic AI", "MCP", "Transformers", "Distributed Systems"],
            "raw_text": content
        }

    async def save_application_tracker(self, applications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Save selected applications to tracker.
        Features intentional recoverable failure on first call if simulate_failure_once is True.
        """
        if self.simulate_failure_once and not self._has_failed_once:
            self._has_failed_once = True
            raise ConnectionResetError("Temporary workspace connection error: Spreadsheet API socket timeout (503 Service Unavailable)")

        # Successful save
        with open(APPLICATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "last_updated": "2026-10-15T12:00:00Z",
                "total_records": len(applications),
                "applications": applications
            }, f, indent=2)

        return {
            "status": "success",
            "saved_count": len(applications),
            "file_path": APPLICATIONS_FILE,
            "message": f"Successfully updated application tracker with {len(applications)} opportunities."
        }

    async def create_email_draft(self, **kwargs) -> Dict[str, Any]:
        """Create and persist an email draft"""
        company = kwargs.get("company", "Target Company")
        role = kwargs.get("role", "AI/ML Intern")
        subject = kwargs.get("subject", f"Application for {role} - Alex Kumar")
        body = kwargs.get("body", "")

        if not body:
            body = (
                f"Dear {company} Hiring Team,\n\n"
                f"I am writing to express my enthusiastic interest in the {role} position. "
                f"As a 3rd-year CS student specializing in Agentic AI and high-throughput LLM orchestration, "
                f"I have built parallel tool-execution frameworks (pReAct) and low-latency RAG systems using PyTorch and FastAPI.\n\n"
                f"I would welcome the opportunity to discuss how my background aligns with your engineering initiatives.\n\n"
                f"Best regards,\nAlex Kumar\n"
                f"alex.kumar@cs.university.edu | +91 98765 43210"
            )

        draft = {
            "company": company,
            "role": role,
            "contact_email": kwargs.get("contact_email", f"careers@{company.lower().replace(' ', '')}.com"),
            "subject": subject,
            "body": body,
            "status": "DRAFTED"
        }

        # Persist to drafts.json
        existing_drafts = []
        if os.path.exists(DRAFTS_FILE):
            try:
                with open(DRAFTS_FILE, "r", encoding="utf-8") as f:
                    existing_drafts = json.load(f)
            except Exception:
                existing_drafts = []
        
        # Avoid duplicate draft entries
        existing_drafts = [d for d in existing_drafts if not (d.get("company") == company and d.get("role") == role)]
        existing_drafts.append(draft)

        with open(DRAFTS_FILE, "w", encoding="utf-8") as f:
            json.dump(existing_drafts, f, indent=2)

        return {
            "status": "success",
            "draft": draft
        }
