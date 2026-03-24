
// Registers the MCP tool `call_function`.
// Calls a MetaCall function and injects the current context.


import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAllContext } from "../context/contextManager.js";
import { callFunction } from "../metacall/runtime.js";


export function registerFunctionTools(server: McpServer): void {

  server.tool(
    "call_function",
    "Call a MetaCall function. Context is automatically appended.",
    {
      func: z.string().describe('Function name, e.g. "greet" or "add"'),
      args: z.array(z.any()).describe("Arguments for the function"),
    },
    async ({ func, args }: { func: string; args: any[] }) => {

      const ctx = getAllContext();

      const argsWithContext = [...args, ctx];

      console.error(`[Tool] call_function: ${func}`);

      try {
        const result = await callFunction(func, argsWithContext);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result)
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: ` Error calling ${func}: ${error.message ?? String(error)}`,
            },
          ],
        };
      }
    }
  );
}
