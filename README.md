# MetaCall MCP Prototype

A **prototype MCP server** demonstrating how **MetaCall** can be integrated with the **Model Context Protocol (MCP)** to allow an AI client to call functions written in **multiple languages (Node.js + Python)**.

The server exposes MCP tools that allow an AI assistant to:
- store and retrieve shared **context**
- call functions loaded through **MetaCall**
- automatically pass the current context to those functions

This project was created as a **GSoC exploration prototype**.

---

# Overview

The MCP server exposes three tools:

- **set_context** – store a value in shared context
- **get_context** – retrieve a stored value
- **call_function** – execute a MetaCall-loaded function

Functions can be written in different languages and executed transparently through MetaCall.

Example flow:

```
set_context("user", "Vikram")
call_function("greet", ["MetaCall"])
→ "Hello MetaCall. Context user: Vikram"

set_context("bonus", 5)
call_function("add", [2, 3])
→ 10
```
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

- **src/** – TypeScript MCP server implementation
- **functions/** – example functions loaded by MetaCall
- **dist/** – compiled JavaScript output

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
---

# Example Functions

## Node.js Function

`functions/greet.cjs`

```javascript
module.exports.greet = function (name, ctx) {
  const user = ctx?.user ?? "Unknown";
  return `Hello ${name}. Context user: ${user}`;
};
```

## Python Function

`functions/add.py`

```python
def add(a, b, ctx):
    bonus = ctx.get("bonus", 0) if ctx else 0
    return a + b + bonus
```

---

# Tech Stack

- **TypeScript**
- **Node.js**
- **MetaCall**
- **Model Context Protocol SDK**

---
