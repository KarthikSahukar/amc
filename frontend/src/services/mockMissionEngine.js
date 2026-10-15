/**
 * Mock Mission Engine for OperatorOS
 * Faithfully implements the exact hackathon demo sequence outlined in Section 31 of the specification:
 * - Scene 1: Planning
 * - Scene 2: Parallel execution (SEARCH, RESUME, DEADLINES simultaneously)
 * - Scene 3: Dependency unlock (DETAILS -> MATCHING)
 * - Scene 4: Failure demo & Checkpoint recovery (SAVE TRACKER fails once -> checkpoint restored -> retried -> success)
 * - Scene 5: Independent Verification loop
 * - Scene 6: Human Approval gate for email drafts
 * - Scene 7: Final results & metrics
 */

export const INITIAL_MISSION_TEXT = 
  "Find 5 AI/ML internships suitable for me, compare them against my resume, save the best 3 to my application tracker, and prepare personalized emails.";

export const INITIAL_DAG_NODES = [
  {
    id: 'mission',
    type: 'custom',
    position: { x: 380, y: 20 },
    data: {
      id: 'mission',
      title: 'MISSION',
      emoji: '🎯',
      description: 'Find 5 AI/ML internships, rank against resume, save top 3, draft emails',
      status: 'SUCCESS',
      tool: null,
      depends_on: [],
      resultPreview: 'Goal parsed into autonomous task graph'
    }
  },
  {
    id: 'planner',
    type: 'custom',
    position: { x: 380, y: 140 },
    data: {
      id: 'planner',
      title: 'PLANNER',
      emoji: '🧠',
      description: 'LLM decomposing goal into dependency DAG (6 tasks identified)',
      status: 'PENDING',
      tool: 'llm_plan()',
      depends_on: ['mission']
    }
  },
  {
    id: 'search',
    type: 'custom',
    position: { x: 60, y: 270 },
    data: {
      id: 'search',
      title: 'SEARCH JOBS',
      emoji: '🔎',
      description: 'Query research MCP for open AI/ML internships',
      status: 'PENDING',
      tool: 'search_jobs',
      arguments: { query: 'AI ML internships 2026' },
      depends_on: ['planner'],
      isParallel: true
    }
  },
  {
    id: 'resume',
    type: 'custom',
    position: { x: 380, y: 270 },
    data: {
      id: 'resume',
      title: 'READ RESUME',
      emoji: '📄',
      description: 'Extract skills and background from local workspace/resume.txt',
      status: 'PENDING',
      tool: 'read_resume',
      arguments: { path: 'workspace/resume.txt' },
      depends_on: ['planner'],
      isParallel: true
    }
  },
  {
    id: 'deadlines',
    type: 'custom',
    position: { x: 700, y: 270 },
    data: {
      id: 'deadlines',
      title: 'FIND DEADLINES',
      emoji: '⏰',
      description: 'Extract application deadlines & calendar milestones',
      status: 'PENDING',
      tool: 'find_deadlines',
      arguments: { scope: 'summer_2026' },
      depends_on: ['planner'],
      isParallel: true
    }
  },
  {
    id: 'details',
    type: 'custom',
    position: { x: 60, y: 400 },
    data: {
      id: 'details',
      title: 'FETCH DETAILS',
      emoji: '📑',
      description: 'Deep scrape job specs & team requirements for 5 openings',
      status: 'PENDING',
      tool: 'fetch_job',
      arguments: { job_ids: ['job_1', 'job_2', 'job_3', 'job_4', 'job_5'] },
      depends_on: ['search']
    }
  },
  {
    id: 'matching',
    type: 'custom',
    position: { x: 380, y: 530 },
    data: {
      id: 'matching',
      title: 'MATCH & RANK',
      emoji: '🧠',
      description: 'Score opportunities against candidate profile with DSPy/LLM matcher',
      status: 'PENDING',
      tool: 'match_candidates',
      depends_on: ['details', 'resume']
    }
  },
  {
    id: 'save',
    type: 'custom',
    position: { x: 180, y: 660 },
    data: {
      id: 'save',
      title: 'SAVE TRACKER',
      emoji: '📊',
      description: 'Persist top 3 ranked jobs to workspace/applications.json',
      status: 'PENDING',
      tool: 'save_application_tracker',
      arguments: { target: 'applications.json' },
      depends_on: ['matching'],
      isParallel: true
    }
  },
  {
    id: 'email',
    type: 'custom',
    position: { x: 580, y: 660 },
    data: {
      id: 'email',
      title: 'DRAFT EMAILS',
      emoji: '✉️',
      description: 'Generate hyper-personalized outreach emails to hiring leads',
      status: 'PENDING',
      tool: 'create_email_draft',
      arguments: { count: 3 },
      depends_on: ['matching'],
      isParallel: true
    }
  },
  {
    id: 'verify',
    type: 'custom',
    position: { x: 380, y: 790 },
    data: {
      id: 'verify',
      title: 'INDEPENDENT VERIFY',
      emoji: '🔍',
      description: 'Verify all 5 requirements: records saved, drafts ready, deadlines verified',
      status: 'PENDING',
      tool: 'verify_mission',
      depends_on: ['save', 'email']
    }
  },
  {
    id: 'approve',
    type: 'custom',
    position: { x: 380, y: 920 },
    data: {
      id: 'approve',
      title: 'HUMAN APPROVAL',
      emoji: '⚠️',
      description: 'Sensitive Action Gate: Awaiting user review before outgoing actions',
      status: 'PENDING',
      tool: 'human_gate',
      depends_on: ['verify']
    }
  },
  {
    id: 'done',
    type: 'custom',
    position: { x: 380, y: 1050 },
    data: {
      id: 'done',
      title: 'MISSION COMPLETE',
      emoji: '✅',
      description: 'All 7 stages fulfilled with 100% verification & recovery demonstration',
      status: 'PENDING',
      tool: null,
      depends_on: ['approve']
    }
  }
];

export const INITIAL_DAG_EDGES = [
  { id: 'e-mission-planner', source: 'mission', target: 'planner', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
  
  { id: 'e-planner-search', source: 'planner', target: 'search', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-planner-resume', source: 'planner', target: 'resume', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-planner-deadlines', source: 'planner', target: 'deadlines', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  
  { id: 'e-search-details', source: 'search', target: 'details', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  
  { id: 'e-details-matching', source: 'details', target: 'matching', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-resume-matching', source: 'resume', target: 'matching', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  
  { id: 'e-matching-save', source: 'matching', target: 'save', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-matching-email', source: 'matching', target: 'email', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  
  { id: 'e-save-verify', source: 'save', target: 'verify', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-email-verify', source: 'email', target: 'verify', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  
  { id: 'e-verify-approve', source: 'verify', target: 'approve', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e-approve-done', source: 'approve', target: 'done', animated: false, style: { stroke: '#475569', strokeWidth: 2 } }
];

export const MOCK_APPLICATIONS = [
  {
    id: "job_1",
    company: "DeepMind Robotics Lab",
    role: "Research Intern, Embodied AI",
    matchScore: 96,
    deadline: "Nov 30, 2026",
    location: "London, UK / Hybrid",
    skillsMatched: ["PyTorch", "Reinforcement Learning", "Diffusion Policies", "Python"],
    status: "Saved to Tracker",
    contact: "hiring-ai@deepmind.example.com"
  },
  {
    id: "job_2",
    company: "Anthropic Safety Team",
    role: "Alignment Science Intern",
    matchScore: 94,
    deadline: "Dec 15, 2026",
    location: "San Francisco, CA",
    skillsMatched: ["Interpretability", "Transformer Architectures", "RLHF", "Evaluation"],
    status: "Saved to Tracker",
    contact: "research-interns@anthropic.example.com"
  },
  {
    id: "job_3",
    company: "OpenAI Foundation",
    role: "Agent Orchestration Engineer Intern",
    matchScore: 91,
    deadline: "Dec 01, 2026",
    location: "San Francisco, CA / Remote",
    skillsMatched: ["MCP Protocol", "Async Python", "DAG Schedulers", "React Flow"],
    status: "Saved to Tracker",
    contact: "agents-team@openai.example.com"
  }
];

export const MOCK_EMAIL_DRAFTS = [
  {
    id: "email_1",
    recipient: "Dr. Elena Vance (Lead, DeepMind Robotics)",
    email: "elena.vance@deepmind.example.com",
    subject: "Application: Research Intern, Embodied AI - Autonomous Mission Systems",
    body: `Dear Dr. Vance,\n\nI recently read DeepMind's work on embodied transformer policies and wanted to reach out regarding the Research Intern opening. Having built autonomous DAG orchestration pipelines with real-time MCP tool scheduling and PyTorch verification models, I believe my background aligns strongly with your lab's mission.\n\nMy portfolio includes multi-threaded agent execution engines and verified failure recovery checkpoints. I've attached my updated resume and would love 15 minutes to discuss how I can contribute to your upcoming benchmark evaluations.\n\nWarm regards,\nAlex Chen\nCandidate #8841`
  },
  {
    id: "email_2",
    recipient: "Marcus Croft (Staff Scientist, Anthropic)",
    email: "marcus.croft@anthropic.example.com",
    subject: "Interest in Alignment Science Internship - Verifiable Agent Architectures",
    body: `Hi Marcus,\n\nI was inspired by Anthropic's commitment to verifiable interpretability in agentic workflows. In my latest project (OperatorOS), I developed an autonomous mission operator that enforces human-in-the-loop checkpoints before any sensitive external action is dispatched.\n\nI would be thrilled to bring this rigor to the Alignment Science Internship for Summer 2026. My resume and project links are attached.\n\nBest regards,\nAlex Chen`
  },
  {
    id: "email_3",
    recipient: "Kiran Patel (Eng Lead, OpenAI Agents)",
    email: "kiran.patel@openai.example.com",
    subject: "Candidate: Agent Orchestration Engineer Intern - MCP Concurrency",
    body: `Hello Kiran,\n\nI saw your posting for the Agent Orchestration Engineer Internship. My recent work focuses on solving ReAct bottlenecks through parallel tool drafting, deduplication, and dependency-aware DAG execution using Model Context Protocol (MCP).\n\nSeeing OpenAI's push toward reliable autonomous operators, I am excited about the potential to contribute immediately to your infrastructure.\n\nThank you for your time and consideration,\nAlex Chen`
  }
];

export const MOCK_VERIFICATION_ITEMS = [
  { label: "5/5 opportunities researched", passed: true, details: "Scraped and parsed 5 AI/ML internship openings from Research MCP" },
  { label: "Top 3 selected & ranked", passed: true, details: "Rankings computed against candidate resume profile (96%, 94%, 91%)" },
  { label: "3/3 tracker records saved", passed: true, details: "Persisted to workspace/applications.json with checkpoint backup" },
  { label: "3/3 email drafts generated", passed: true, details: "Drafted tailored outreach letters addressing key technical skills" },
  { label: "3/3 emails personalized with resume context", passed: true, details: "Verified zero hallucinations or missing template placeholders" }
];
