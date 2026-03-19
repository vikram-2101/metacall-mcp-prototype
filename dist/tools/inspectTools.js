import { inspectFunctions } from '../metacall/runtime.js';
export function registerInspectTool(server) {
    server.tool('inspect', 'List all MetaCall-loaded functions with their argument names, types, and return type. ' +
        'Use this before calling call_function to discover what is available.', {}, async () => {
        const fns = inspectFunctions();
        if (fns.length === 0) {
            return {
                content: [{ type: 'text', text: 'No functions currently loaded in MetaCall.' }],
            };
        }
        // Format as MCP-tool-definition style JSON — mirrors what GSoC will auto-generate
        const toolDefs = fns.map(fn => ({
            name: fn.name,
            runtime: fn.runtime,
            inputSchema: {
                type: 'object',
                properties: Object.fromEntries(fn.args
                    .filter(a => a.name !== 'ctx') // ctx is auto-injected, hide from schema
                    .map(a => [a.name, { type: mapMetaCallType(a.type) }])),
                required: fn.args
                    .filter(a => a.name !== 'ctx')
                    .map(a => a.name),
            },
            returns: fn.ret,
        }));
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(toolDefs, null, 2),
                }],
        };
    });
}
// Map MetaCall Python type strings to JSON Schema types
function mapMetaCallType(type) {
    const map = {
        'String': 'string',
        'Int': 'number',
        'Long': 'number',
        'Float': 'number',
        'Double': 'number',
        'Bool': 'boolean',
        'Array': 'array',
        'Map': 'object',
    };
    return map[type] ?? 'string'; // empty string ("") → default to "string"
}
