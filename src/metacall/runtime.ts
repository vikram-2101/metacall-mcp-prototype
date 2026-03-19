
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

export interface FunctionMeta {
  name: string;
  runtime: string;
  args: Array<{ name: string; type: string }>;
  ret: string;
}

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

const { metacall, metacall_load_from_file } = api as {
  metacall: (func: string, ...args: any[]) => Promise<any>;
  metacall_load_from_file: (tag: string, paths: string[]) => void;
};

const functionsDir = path.resolve(__dirname, "../../functions");


// Loads the Node.js and Python function files into MetaCall.

export function loadFunctions(): void {
  const configPath = path.resolve(__dirname, '../../metacall.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  console.log("MetaCall loading functions from: ", functionsDir);
  for (const loader of config.scripts) {
    const tag: string = loader.tag;
    const files: string[] = loader.scripts.map((f: string) =>
      path.join(functionsDir, f)
    );
    metacall_load_from_file(tag, files);
    console.log(`[MetaCall] Loaded ${loader.scripts.join(", ")} (${tag})`);
  }
}


// Calling a MetaCall function by name with the given arguments.

export async function callFunction(name: string, args: any[]): Promise<any> {
  console.log(`[MetaCall] Calling function: ${name}`);
  const result = await metacall(name, ...args);
  console.log(`[MetaCall] Result from ${name}`);
  return result;
}

export function inspectFunctions(): FunctionMeta[] {
  const raw = metacall_inspect();
  const results: FunctionMeta[] = [];

  if (!raw || typeof raw !== 'object') return results;


  for (const [runtime, scripts] of Object.entries(raw)) {


    if (runtime === 'ext') continue;
    if (!Array.isArray(scripts)) continue;

    for (const script of scripts) {
      const scriptName: string = script?.name ?? '';

      if (scriptName.includes('gnu/store')) continue;
      if (scriptName.includes('dist/')) continue;
      if (scriptName.includes('plugins/')) continue;

      const funcs = script?.scope?.funcs;
      if (!Array.isArray(funcs)) continue;

      for (const fn of funcs) {
        const fnName: string = fn?.name;
        if (!fnName) continue;

        const sigArgs = fn?.signature?.args ?? [];

        results.push({
          name: fnName,
          runtime,
          args: sigArgs.map((a: any) => ({
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