import json
import os
from typing import Dict, Any, List

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
JOBS_FILE = os.path.join(DATA_DIR, "jobs.json")

class ResearchMCPServer:
    """
    Research MCP Server
    Exposes research-related capabilities:
    - search_jobs(query)
    - fetch_job(job_id)
    """

    def __init__(self):
        self.server_name = "ResearchMCP"
        self._load_jobs()

    def _load_jobs(self):
        if os.path.exists(JOBS_FILE):
            with open(JOBS_FILE, "r", encoding="utf-8") as f:
                self.jobs_db = json.load(f)
        else:
            self.jobs_db = []

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "search_jobs",
                "description": "Search for relevant internship and job opportunities based on a query.",
                "server": self.server_name,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search keywords like 'AI ML internship'"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "fetch_job",
                "description": "Fetch detailed description, requirements, and deadline for a specific job ID.",
                "server": self.server_name,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "job_id": {"type": "string", "description": "Unique identifier of the job (e.g. job_01)"}
                    },
                    "required": ["job_id"]
                }
            }
        ]

    async def search_jobs(self, query: str = "") -> Dict[str, Any]:
        """Search jobs matching query keywords"""
        self._load_jobs()
        query_terms = [t.lower() for t in query.split() if len(t) > 2]
        
        results = []
        for job in self.jobs_db:
            job_text = f"{job['title']} {job['company']} {' '.join(job['skills'])} {job['description']}".lower()
            if not query_terms or any(term in job_text for term in query_terms) or "intern" in query.lower():
                results.append({
                    "id": job["id"],
                    "title": job["title"],
                    "company": job["company"],
                    "location": job["location"],
                    "skills": job["skills"],
                    "deadline": job["deadline"],
                    "url": job["url"],
                    "stipend": job["stipend"]
                })
        
        # If no query filter matched specifically, return all available opportunities
        if not results:
            results = [{
                "id": j["id"],
                "title": j["title"],
                "company": j["company"],
                "location": j["location"],
                "skills": j["skills"],
                "deadline": j["deadline"],
                "url": j["url"],
                "stipend": j["stipend"]
            } for j in self.jobs_db]

        return {
            "query": query,
            "total_found": len(results),
            "jobs": results
        }

    async def fetch_job(self, job_id: str) -> Dict[str, Any]:
        """Fetch complete details for a job ID"""
        self._load_jobs()
        for job in self.jobs_db:
            if job["id"] == job_id:
                return {
                    "id": job["id"],
                    "title": job["title"],
                    "company": job["company"],
                    "location": job["location"],
                    "skills": job["skills"],
                    "deadline": job["deadline"],
                    "stipend": job["stipend"],
                    "description": job["description"],
                    "url": job["url"],
                    "match_score": job.get("match_score", 85)
                }
        return {"error": f"Job ID {job_id} not found", "job_id": job_id}
