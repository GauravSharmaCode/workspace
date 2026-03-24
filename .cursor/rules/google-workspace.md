---
description: Google Workspace MCP Server development and usage guide
globs: ["workspace-server/src/**/*.ts", "skills/**/*.md", "commands/**/*.toml"]
alwaysApply: true
---

# Google Workspace MCP Server

This is a Google Workspace Extension providing MCP tools for Docs, Sheets,
Slides, Gmail, Drive, Calendar, Chat, and People APIs.

## Build & Test

```bash
npm install && npm run build   # install and build
npm test                       # run all tests
npx jest <path/to/test.ts>     # run a single test
npm run lint && npm run lint:fix
```

## Development Conventions

- Entry point: `workspace-server/src/index.ts` (registers all MCP tools)
- Services: `workspace-server/src/services/` (one file per Google service)
- Tests: `workspace-server/src/__tests__/services/` (mirrors services/)
- Every `.ts` file needs the Apache 2.0 license header comment block
- Node.js imports must use the `node:` prefix (e.g., `node:fs`, `node:path`)
- Unused vars/params must be prefixed with `_`
- Service methods are arrow functions on class properties (not regular methods)

## Adding a New Tool

1. Add an arrow-function method to the relevant `services/*.ts` class
2. Call `server.registerTool('namespace.action', { description, inputSchema }, handler)` in `index.ts`
3. Use zod for `inputSchema` — see existing tools for patterns
4. Add a test in `__tests__/services/`

## MCP Resources Available (when server is running)

Load these to get behavioral guidance for using the extension:

- `workspace://context` — Core behavioral guide
- `workspace://skills/gmail`, `workspace://skills/google-docs`, etc.

See [AGENT-CONTEXT.md](../../AGENT-CONTEXT.md) for the full behavioral guide.
