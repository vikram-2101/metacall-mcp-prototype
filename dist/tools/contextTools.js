// set_context — stores a key-value pair in context
// get_context — retrieves a value from context by key
import { z } from "zod";
import { setContext, getContext } from "../context/contextManager.js";
export function registerContextTools(server) {
    // Stores a value in the shared context under the given key.
    server.tool("set_context", "Store a key-value pair in the shared MCP context.", {
        key: z.string().describe("The key to store the value under"),
        value: z.any().describe("The value to store"),
    }, async ({ key, value }) => {
        setContext(key, value);
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(value),
                },
            ],
        };
    });
    // Retrieves a value from context by key.
    server.tool("get_context", "Retrieve a value from the shared MCP context by key.", {
        key: z.string().describe("The key to search for in the context"),
    }, async ({ key }) => {
        const value = getContext(key);
        if (value === undefined) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No value found: "${key}"`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(value),
                },
            ],
        };
    });
}
