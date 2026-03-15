
  // MetaCall lets us call functions written in different languages
  // (Node.js, Python, Ruby, etc.) from a single runtime.


import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);


const raw = require("metacall");

console.error("[MetaCall] Package exports:", JSON.stringify(Object.keys(raw ?? {})));


const api = (raw?.metacall_load_from_file)
  ? raw
  : (raw?.default?.metacall_load_from_file)
    ? raw.default
    : raw;  

const { metacall, metacall_load_from_file } = api as {
  metacall: (func: string, ...args: any[]) => Promise<any>;
  metacall_load_from_file: (tag: string, paths: string[]) => void;
};

const functionsDir = path.resolve(__dirname, "../../functions");


// Loads the Node.js and Python function files into MetaCall.

export function loadFunctions(): void {
  console.log("[MetaCall] Loading functions from:", functionsDir);

  // Load Node.js function: greet.cjs
  metacall_load_from_file("node", [path.join(functionsDir, "greet.cjs")]);
  console.log("[MetaCall] Loaded greet.cjs (Node.js)");

  // Load Python function: add.py
  metacall_load_from_file("py", [path.join(functionsDir, "add.py")]);
  console.log("[MetaCall] Loaded add.py (Python)");
}


// Calls a MetaCall function by name with the given arguments.

export async function callFunction(name: string, args: any[]): Promise<any> {
  console.log(`[MetaCall] Calling function: ${name}`);
  const result = await metacall(name, ...args);
  console.log(`[MetaCall] Result from ${name}`);
  return result;
}