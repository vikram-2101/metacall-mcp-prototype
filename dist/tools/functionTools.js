// Registers the MCP tool `call_function`.
// Calls a MetaCall function and injects the current context.
import { z } from "zod";
import { getAllContext } from "../context/contextManager.js";
import { callFunction } from "../metacall/runtime.js";
export function registerFunctionTools(server) {
    server.tool("call_function", "Call a MetaCall function. Context is automatically appended.", {
        func: z.string().describe('Function name, e.g. "greet" or "add"'),
        args: z.array(z.any()).describe("Arguments for the function"),
    }, async ({ func, args }) => {
        const ctx = getAllContext();
        const argsWithContext = [...args, ctx];
        console.log(`[Tool] call_function: ${func}`);
        try {
            const result = await callFunction(func, argsWithContext);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result)
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: ` Error calling ${func}: ${error.message ?? String(error)}`,
                    },
                ],
            };
        }
    });
}
