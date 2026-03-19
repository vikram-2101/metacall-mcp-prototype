// MetaCall lets us call functions written in different languages
// (Node.js, Python, Ruby, etc.) from a single runtime.
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const metacall_inspect = require("metacall").metacall_inspect;
const raw = require("metacall");
console.error("[MetaCall] Package exports:", JSON.stringify(Object.keys(raw ?? {})));
import fs from 'fs';
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
    console.log("MetaCall loading functions from: ", functionsDir);
    for (const loader of config.scripts) {
        const tag = loader.tag;
        const files = loader.scripts.map((f) => path.join(functionsDir, f));
        metacall_load_from_file(tag, files);
        console.log(`[MetaCall] Loaded ${loader.scripts.join(", ")} (${tag})`);
    }
    // console.log("[MetaCall] Loading functions from:", functionsDir);
    // // Load Node.js function: greet.cjs
    // metacall_load_from_file("node", [path.join(functionsDir, "greet.cjs")]);
    // console.log("[MetaCall] Loaded greet.cjs (Node.js)");
    // // Load Python function: add.py
    // metacall_load_from_file("py", [path.join(functionsDir, "add.py")]);
    // console.log("[MetaCall] Loaded add.py (Python)");
}
// Calls a MetaCall function by name with the given arguments.
export async function callFunction(name, args) {
    console.log(`[MetaCall] Calling function: ${name}`);
    const result = await metacall(name, ...args);
    console.log(`[MetaCall] Result from ${name}`);
    return result;
}
// Add this exported function
export function inspectFunctions() {
    const raw = metacall_inspect();
    const results = [];
    if (!raw || typeof raw !== 'object')
        return results;
    // raw shape: { "node": [...scripts], "py": [...scripts], "ext": [...internal] }
    for (const [runtime, scripts] of Object.entries(raw)) {
        // Skip MetaCall's own internal loaders — we only want user functions
        if (runtime === 'ext')
            continue;
        if (!Array.isArray(scripts))
            continue;
        for (const script of scripts) {
            const scriptName = script?.name ?? '';
            // Filter out MetaCall internals: only keep scripts from the functions/ dir
            // or short names (no gnu/store paths, no dist/server.js)
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
                        type: a.type?.name || 'any', // e.g. "String", "Int", or "" → "any"
                    })),
                    ret: fn?.signature?.ret?.type?.name || 'any',
                });
            }
        }
    }
    return results;
}
