# Google Workspace MCP Server — Claude Guide

This is a Google Workspace Extension that provides tools for interacting with
Google Workspace services (Docs, Sheets, Slides, Gmail, Drive, Calendar, Chat,
People) via the Model Context Protocol (MCP).

## Building and Running

- **Install dependencies:** `npm install`
- **Build the project:** `npm run build`
- **Run tests:** `npm test`
- **Lint:** `npm run lint`

## Development Conventions

This project uses TypeScript and the MCP SDK. The main entry point is
`workspace-server/src/index.ts`, which initializes the MCP server and registers
all tools.

Business logic for each service lives in `workspace-server/src/services/`.
Authentication is handled by `workspace-server/src/auth/AuthManager.ts`.

All source files must start with the Apache 2.0 license header. Node.js
built-ins must use the `node:` protocol prefix (e.g., `import from 'node:fs'`).

## Adding New Tools

1. Add a method to the appropriate service in `workspace-server/src/services/`.
2. Register it in `workspace-server/src/index.ts` via `server.registerTool()`.
3. Add a test in `workspace-server/src/__tests__/services/`.

## Using This Extension as an MCP Client

If you have this MCP server configured and running, the following MCP resources
are available to load behavioral guidance into your context:

- `workspace://context` — Core behavioral guide (best practices, formatting, error handling)
- `workspace://skills/gmail` — Gmail composition and search guide
- `workspace://skills/google-docs` — Google Docs two-step format workflow
- `workspace://skills/google-calendar` — Calendar timezone-first workflow
- `workspace://skills/google-chat` — Chat message formatting guide
- `workspace://skills/google-sheets` — Sheets query and range guide
- `workspace://skills/google-slides` — Slides text extraction and image guide

Load `workspace://context` at the start of a session for general guidance, and
load the relevant skill resource before working with a specific service.

See [AGENT-CONTEXT.md](AGENT-CONTEXT.md) for a standalone copy of the
behavioral guide that can be pasted as a system prompt.
