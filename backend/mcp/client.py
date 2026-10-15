import time
from typing import Dict, Any, List, Optional
from mcp.research_server import ResearchMCPServer
from mcp.workspace_server import WorkspaceMCPServer

class MCPClient:
    """
    Unified MCP Client that registers and communicates with MCP servers:
    - Research MCP Server
    - Workspace MCP Server
    Provides tool discovery, schema inspection, and tool invocation.
    """

    def __init__(self, simulate_failure: bool = True):
        self.research_server = ResearchMCPServer()
        self.workspace_server = WorkspaceMCPServer(simulate_failure_once=simulate_failure)
        self.tool_registry: Dict[str, Dict[str, Any]] = {}
        self._register_all_tools()

    def reset(self, simulate_failure: bool = True):
        self.workspace_server.simulate_failure_once = simulate_failure
        self.workspace_server.reset_failure_simulation()

    def _register_all_tools(self):
        """Discover tools from all connected MCP servers"""
        for tool in self.research_server.get_tool_definitions():
            self.tool_registry[tool["name"]] = {
                "definition": tool,
                "server_instance": self.research_server
            }

        for tool in self.workspace_server.get_tool_definitions():
            self.tool_registry[tool["name"]] = {
                "definition": tool,
                "server_instance": self.workspace_server
            }

    def list_tools(self) -> List[Dict[str, Any]]:
        """Return tool definitions for planner and LLM consumption"""
        return [item["definition"] for item in self.tool_registry.values()]

    def get_tool_server(self, tool_name: str) -> Optional[str]:
        if tool_name in self.tool_registry:
            return self.tool_registry[tool_name]["definition"]["server"]
        return None

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool via the MCP client dispatch"""
        if tool_name not in self.tool_registry:
            raise ValueError(f"Tool '{tool_name}' is not registered with any connected MCP server.")

        server_entry = self.tool_registry[tool_name]
        server_instance = server_entry["server_instance"]
        start_time = time.time()

        # Invoke method on the respective MCP server
        method = getattr(server_instance, tool_name, None)
        if not method or not callable(method):
            raise AttributeError(f"MCP server does not implement handler for '{tool_name}'")

        try:
            result = await method(**arguments)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "tool": tool_name,
                "server": server_entry["definition"]["server"],
                "elapsed_ms": elapsed_ms,
                "data": result
            }
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "success": False,
                "tool": tool_name,
                "server": server_entry["definition"]["server"],
                "elapsed_ms": elapsed_ms,
                "error": str(e)
            }
