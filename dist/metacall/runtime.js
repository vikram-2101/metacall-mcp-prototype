import fs from 'fs';
// Suppress MetaCall's stdout banner — MCP requires clean stdout
const devNull = fs.openSync('/dev/null', 'w');
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...args) => {
    // Allow only JSON (MCP messages), suppress everything else
    const str = chunk.toString();
    if (str.trimStart().startsWith('{') || str.trimStart().startsWith('[')) {
        return originalStdoutWrite(chunk, ...args);
    }
    return true; // silently discard non-JSON stdout
};
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const metacall_inspect = require("metacall").metacall_inspect;
const raw = require("metacall");
console.error("[MetaCall] Package exports:", JSON.stringify(Object.keys(raw ?? {})));
const api = (raw?.metacall_load_from_file)
    ? raw
    : (raw?.default?.metacall_load_from_file)
        ? raw.default
        : raw;
const { metacall, metacall_load_from_file } = api;
const functionsDir = path.resolve(__dirname, "../../functions");
// Loads the Node.js and Python function files into MetaCall.
export function loadFunctions() {
    const configPath = path.resolve(__dirname, '../../metacall.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.error("MetaCall loading functions from: ", functionsDir);
    for (const loader of config.scripts) {
        const tag = loader.tag;
        const files = loader.scripts.map((f) => path.join(functionsDir, f));
        metacall_load_from_file(tag, files);
        console.error(`[MetaCall] Loaded ${loader.scripts.join(", ")} (${tag})`);
    }
}
// Calling a MetaCall function by name with the given arguments.
export async function callFunction(name, args) {
    console.error(`[MetaCall] Calling function: ${name}`);
    const result = await metacall(name, ...args);
    console.error(`[MetaCall] Result from ${name}`);
    return result;
}
export function inspectFunctions() {
    const raw = metacall_inspect();
    const results = [];
    if (!raw || typeof raw !== 'object')
        return results;
    for (const [runtime, scripts] of Object.entries(raw)) {
        if (runtime === 'ext')
            continue;
        if (!Array.isArray(scripts))
            continue;
        for (const script of scripts) {
            const scriptName = script?.name ?? '';
            if (scriptName.includes('gnu/store'))
                continue;
            if (scriptName.includes('dist/'))
                continue;
            if (scriptName.includes('plugins/'))
                continue;
            const funcs = script?.scope?.funcs;
            if (!Array.isArray(funcs))
                continue;
            for (const fn of funcs) {
                const fnName = fn?.name;
                if (!fnName)
                    continue;
                const sigArgs = fn?.signature?.args ?? [];
                results.push({
                    name: fnName,
                    runtime,
                    args: sigArgs.map((a) => ({
                        name: a.name ?? 'arg',
                        type: a.type?.name || 'any',
                    })),
                    ret: fn?.signature?.ret?.type?.name || 'any',
                });
            }
        }
    }
    return results;
}
