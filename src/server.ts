
// Entry point for the MetaCall MCP server.
//  Initializes the MCP server, loads MetaCall functions,
//  registers tools, and starts the stdio transport.
 

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadFunctions } from "./metacall/runtime.js";
import { registerContextTools } from "./tools/contextTools.js";
import { registerFunctionTools } from "./tools/functionTools.js";

async function main() {

  console.error("[Server] Starting MetaCall MCP Server...");

  const server = new McpServer({
    name: "metacall-mcp-server",
    version: "1.0.0",
  });

  // Load MetaCall functions (Node + Python)
  try {
    loadFunctions();
    console.error("[Server] MetaCall functions loaded.");
  } catch (err) {
    console.error("[Server] Failed to load MetaCall functions:", err);
  }

  // Register MCP tools
  registerContextTools(server);
  registerFunctionTools(server);

  console.error("[Server] Tools registered: set_context, get_context, call_function");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[Server] MCP server running.");
}

main().catch((err) => {
  console.error("[Server] Fatal error:", err);
  process.exit(1);
});