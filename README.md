# MetaCall MCP Prototype

> **GSoC Prototype** — A working demonstration of [MetaCall](https://metacall.io) integrated with the [Model Context Protocol (MCP)](https://modelcontextprotocol.io), enabling an AI like Claude to call functions written in **multiple languages** (Node.js + Python) with **shared context** across calls.

---

## Table of Contents

- [What This Project Does](#what-this-project-does)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Testing the Tools](#testing-the-tools)
- [Connecting to Claude Desktop](#connecting-to-claude-desktop)
- [MCP Tools Reference](#mcp-tools-reference)
- [The Functions](#the-functions)
---

## What This Project Does

This project builds an **MCP server** that lets an AI assistant (like Claude) call real functions at runtime — functions written in **different programming languages** — with **shared context** that persists across multiple tool calls.

### The Three Core Ideas

| Concept | What It Means |
|---|---|
| **MCP** | A protocol that lets an AI call tools you define, over stdin/stdout |
| **MetaCall** | A polyglot runtime that lets Node.js call Python functions (and vice versa) natively |
| **Context** | A shared key-value store that accumulates state and is automatically passed to every function |

### Example Session

```
AI: set_context("user", "Vikram")
→  Context stored: { user: "Vikram" }

AI: call_function("greet", ["MetaCall"])
→  greet("MetaCall", { user: "Vikram" })   ← context auto-injected
→  "Hello MetaCall. Context user: Vikram"

AI: set_context("bonus", 5)
→  Context stored: { user: "Vikram", bonus: 5 }

AI: call_function("add", [2, 3])
→  add(2, 3, { user: "Vikram", bonus: 5 }) ← context auto-injected
→  10   (2 + 3 + 5 bonus)
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude / MCP Client                     │
│         "set user=Vikram, then call greet(MetaCall)"        │
└────────────────────────┬────────────────────────────────────┘
                         │  JSON-RPC over stdin/stdout
                         │  (Model Context Protocol)
┌────────────────────────▼────────────────────────────────────┐
│                     MCP Server (server.ts)                  │
│                                                             │
│   ┌──────────────────────┐   ┌───────────────────────────┐  │
│   │   Context Manager    │   │    MetaCall Runtime        │  │
│   │                      │   │                           │  │
│   │  { user: "Vikram",   │──►│  greet()  →  greet.cjs    │  │
│   │    bonus: 5 }        │   │  add()    →  add.py        │  │
│   └──────────────────────┘   └───────────────────────────┘  │
│                                                             │
│   Tools:  set_context  │  get_context  │  call_function     │
└─────────────────────────────────────────────────────────────┘
```

1. The AI sends a tool call over stdin (MCP protocol)
2. The server routes it to the right handler
3. If it's `call_function`, the handler grabs the current context and appends it to the arguments
4. MetaCall executes the function — in Node.js or Python, transparently
5. The result is returned to the AI over stdout

---

## Project Structure

```
metacall-mcp/
│
├── src/                            # TypeScript source code
│   ├── server.ts                   # Entry point — boots everything up
│   ├── context/
│   │   └── contextManager.ts       # Simple key-value store for shared state
│   ├── metacall/
│   │   └── runtime.ts              # Loads files into MetaCall, calls functions
│   ├── tools/
│   │   ├── contextTools.ts         # MCP tools: set_context, get_context
│   │   └── functionTools.ts        # MCP tool: call_function (injects context)
│   └── types/
│       └── metacall.d.ts           # TypeScript type declarations for metacall
│
├── functions/                      # The actual functions MetaCall loads
│   ├── greet.cjs                   # Node.js function: greet(name, ctx)
│   └── add.py                      # Python function: add(a, b, ctx)
│
├── dist/                           # Compiled JavaScript output (auto-generated)
├── metacall.json                   # MetaCall configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

### 1. MetaCall

MetaCall is the polyglot runtime that lets Node.js execute Python functions natively. Install it with:

```bash
curl -sL https://raw.githubusercontent.com/metacall/install/master/install.sh | bash
```

Verify it is available:

```bash
metacall
# Should open a MetaCall REPL — press Ctrl+C to exit
```

> **Note:** `metacall --version` is not a supported flag and will print an error — that is expected and fine. If the REPL opens, MetaCall is installed correctly.

### 2. Node.js v18 or higher

```bash
node --version   # should print v18.x.x or higher
```

### 3. npm

```bash
npm --version    # included with Node.js
```

---

## Installation

```bash
# 1. Enter the project directory
cd metacall-mcp

# 2. Install dependencies
npm install
```

This installs:
- `@modelcontextprotocol/sdk` — the MCP server framework
- `metacall` — Node.js bindings for MetaCall
- `typescript`, `@types/node` — TypeScript tooling

---

## Running the Server

```bash
npm run dev
```

This command:
1. Compiles TypeScript to `dist/` via `tsc`
2. Runs `metacall dist/server.js` (not plain `node` — [see why](#why-metacall-instead-of-node))

**Expected output:**

```
[MetaCall] Loading functions from: /your/path/functions
[MetaCall] ✅ Loaded greet.cjs (Node.js)
[MetaCall] ✅ Loaded add.py (Python)
[Server] MetaCall functions loaded successfully.
[Server] MCP tools registered: set_context, get_context, call_function
[Server] MetaCall MCP Server is running. Waiting for client messages...
```

The server stays running and listens for MCP messages on stdin. Stop it with `Ctrl+C`.

---

## Testing the Tools

Since the server communicates over stdin/stdout, you can test it directly by piping JSON-RPC messages:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"set_context","arguments":{"key":"user","value":"Vikram"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"call_function","arguments":{"func":"greet","args":["MetaCall"]}}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"set_context","arguments":{"key":"bonus","value":5}}}
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"call_function","arguments":{"func":"add","args":[2,3]}}}' | metacall dist/server.js
```

**Expected responses:**

```
✅ Context updated: user = "Vikram"
✅ greet() returned: "Hello MetaCall. Context user: Vikram"
✅ Context updated: bonus = 5
✅ add() returned: 10
```

---

## MCP Tools Reference

### `set_context`

Stores a value in the shared context under a given key. The context persists across all tool calls in the session and is automatically injected into every `call_function` call.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | The name to store the value under |
| `value` | `any` | The value to store (string, number, object, etc.) |

```json
{ "key": "user", "value": "Vikram" }
→  "✅ Context updated: user = \"Vikram\""
```

---

### `get_context`

Retrieves a value from the shared context by key.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | The key to look up |

```json
{ "key": "user" }
→  "📦 Context[user] = \"Vikram\""
```

---

### `call_function`

Calls a MetaCall-loaded function by name. The entire current context is automatically appended as the last argument — functions receive it without any extra configuration.

| Parameter | Type | Description |
|---|---|---|
| `func` | `string` | The function name: `"greet"` or `"add"` |
| `args` | `array` | Arguments to pass (context is appended automatically) |

```json
{ "func": "greet", "args": ["MetaCall"] }
```

What actually gets called internally:

```javascript
greet("MetaCall", { user: "Vikram", bonus: 5 })
//               ↑ full context, auto-injected
```

---

## The Functions

### `functions/greet.cjs` — Node.js

```javascript
module.exports.greet = function (name, ctx) {
  const user = (ctx && ctx.user) ? ctx.user : "Unknown";
  return `Hello ${name}. Context user: ${user}`;
};
```

Written as CommonJS (`.cjs`) because MetaCall's Node.js loader expects the `module.exports` format. It receives the MCP context as `ctx` and reads `ctx.user` from it.

### `functions/add.py` — Python

```python
def add(a, b, ctx):
    bonus = ctx.get("bonus", 0) if ctx else 0
    return a + b + bonus
```

Plain Python with no imports or framework. Receives the context as a dict and reads `ctx["bonus"]`. MetaCall handles everything else.

Both functions are completely unaware of MCP — they are just normal functions that accept a `ctx` parameter. All the cross-language plumbing is handled by MetaCall.


## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| TypeScript | 5.x | Language |
| Node.js | 18+ | Runtime |
| MetaCall | 0.9.x | Polyglot function execution |
| `@modelcontextprotocol/sdk` | 1.x | MCP server framework |
| `metacall` (npm) | 0.1.x | Node.js bindings for MetaCall |
| Zod | via MCP SDK | Tool argument validation |

---

## License

MIT