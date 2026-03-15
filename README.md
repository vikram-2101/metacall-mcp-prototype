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

# Project Structure

```
metacall-mcp/
│
├── src/
│   ├── server.ts
│   ├── context/
│   ├── metacall/
│   ├── tools/
│   └── types/
│
├── functions/
│   ├── greet.cjs
│   └── add.py
│
├── dist/
├── metacall.json
├── package.json
└── README.md
```

- **src/** – TypeScript MCP server implementation
- **functions/** – example functions loaded by MetaCall
- **dist/** – compiled JavaScript output

---

# Prerequisites

## MetaCall

Install MetaCall:

```bash
curl -sL https://raw.githubusercontent.com/metacall/install/master/install.sh | bash
```

Verify installation:

```bash
metacall
```

---

## Node.js

Node.js **v18 or higher** is required.

```bash
node --version
```

---

# Installation

Install dependencies:

```bash
npm install
```

---

# Running the Server

Start the MCP server:

```bash
npm run dev
```

This will:
1. Compile the TypeScript source
2. Start the MCP server using MetaCall

> **Note:** The server must be run with `metacall` (not plain `node`) so that MetaCall's language runtimes are initialized before the server starts.

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
