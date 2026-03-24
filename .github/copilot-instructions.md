# GitHub Copilot Instructions

## Project Overview

This is a **Google Workspace Extension for Gemini CLI** — an MCP (Model Context Protocol) server that exposes Google Workspace APIs (Docs, Sheets, Slides, Gmail, Drive, Calendar, Chat, People) as tools callable by AI assistants via stdio transport.

## Build, Test, and Lint

```bash
# Install dependencies
npm install

# Build (esbuild bundles workspace-server/src into workspace-server/dist)
npm run build

# Run all tests (Jest + ts-jest, runs from repo root)
npm test

# Run a single test file
npx jest workspace-server/src/__tests__/services/DocsService.test.ts

# Run tests matching a name pattern
npx jest --testNamePattern "should create document"

# Lint (TypeScript ESLint, applies only to workspace-server/src/**/*.ts)
npm run lint
npm run lint:fix

# Format (Prettier)
npm run format:check
npm run format:fix

# Before submitting a PR
npm run test && npm run lint
```

> Tests run from the repo root even when invoked from `workspace-server/`. The `test` script in `workspace-server/package.json` does `cd ..` before running Jest.

## Architecture

### Two-Layer Structure

The repo has two distinct layers:

1. **`workspace-server/`** — The MCP server (TypeScript, compiled with esbuild). This is the core implementation.
2. **`commands/` + `skills/`** — Gemini CLI extension artifacts (`.toml` command definitions and `SKILL.md` behavior guides). These are consumed by the Gemini CLI, not by the MCP server.

### MCP Server (`workspace-server/src/`)

- **`index.ts`** — Single entry point. Creates `McpServer`, instantiates all service classes, and registers 100+ tools via `server.registerTool()`. All tool names use dot notation (e.g., `docs.create`, `gmail.search`).
- **`services/`** — One class per Google Workspace service (`DocsService`, `GmailService`, etc.). Each receives `AuthManager` in its constructor and exposes public methods that map 1:1 to registered MCP tools.
- **`auth/AuthManager.ts`** — Orchestrates OAuth 2.0. Uses a hybrid token storage: OS keychain (primary) → AES-256-GCM encrypted file (fallback).
- **`utils/`** — Shared helpers: `IdUtils.ts` (extracts IDs from Google URLs), `DriveQueryBuilder.ts`, `tool-normalization.ts` (converts tool names between dot and underscore formats for MCP compatibility), `logger.ts`, `validation.ts`.

### Adding a New Tool

1. Add a method to the relevant service in `workspace-server/src/services/`.
2. Register it in `workspace-server/src/index.ts` via `server.registerTool('namespace.action', { description, inputSchema }, handler)`.
3. Input schemas use **zod** — see existing tools for patterns.
4. Add a corresponding test in `workspace-server/src/__tests__/services/`.

### `commands/` and `skills/`

- **`commands/<service>/<name>.toml`** — Defines Gemini CLI slash commands with a `description` and `prompt` template. The `prompt` field contains LLM instructions using `{{args}}` for user input.
- **`skills/<service>/SKILL.md`** — Detailed behavioral guides loaded by Gemini when a relevant skill is activated. These override default AI behavior for that service (e.g., the Google Docs skill mandates a two-step create-then-format workflow).

### `cloud_function/`

Standalone Google Cloud Function (Node.js, no TypeScript) that handles the OAuth 2.0 callback redirect and stores credentials in Google Cloud Secret Manager. Independent from the MCP server.

## Key Conventions

### License Header Requirement

**Every `.ts` file must start with this license header** (enforced by ESLint `eslint-plugin-headers`):

```typescript
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
```

The year must match `202[5-6]`. `workspace-server/src/index.ts` is exempt (has a shebang line).

### Node Protocol Imports

All Node.js built-in imports must use the `node:` protocol (enforced by ESLint):

```typescript
// ✅ Correct
import { readFile } from 'node:fs/promises';

// ❌ Wrong
import { readFile } from 'fs/promises';
```

### Path Alias

`@/` maps to `workspace-server/src/` in both TypeScript and Jest:

```typescript
import { something } from '@/utils/constants';
```

### Service Method Pattern

Service methods are arrow functions assigned to public class properties (not regular methods), so they can be passed directly as MCP tool handlers without binding:

```typescript
export class ExampleService {
  constructor(private authManager: AuthManager) {}

  public doSomething = async ({ param }: { param: string }) => {
    const client = await this.getClient();
    // ...
  };

  private async getClient() { /* ... */ }
}
```

### Test Structure

Tests live in `workspace-server/src/__tests__/`, mirroring the source structure:

- `__tests__/services/` → tests for `services/`
- `__tests__/auth/` → tests for `auth/`
- `__tests__/utils/` → tests for `utils/`
- `__tests__/mocks/` → shared mock data and stubs

Test files use `.test.ts` suffix. The `setup.ts` file silences `console.log/info/debug` during tests (errors and warnings are kept).

### Build System

The project uses **esbuild** (not `tsc`) to bundle the server into a single `workspace-server/dist/index.js`. The TypeScript compiler is used only for type-checking via ts-jest in tests. The root `tsconfig.json` has `strict: false` in the Jest configuration.

### Unused Variables

Prefix unused variables/parameters with `_` to suppress the ESLint warning:

```typescript
async function handler(_req: Request, res: Response) { ... }
```

## MCP Resources

The server exposes MCP resources for behavioral guidance, accessible to any
resource-capable MCP client:

- `workspace://context` — Core behavioral guide (`WORKSPACE-Context.md`)
- `workspace://skills/gmail` — Gmail guide
- `workspace://skills/google-docs` — Docs guide
- `workspace://skills/google-calendar` — Calendar guide
- `workspace://skills/google-chat` — Chat guide
- `workspace://skills/google-sheets` — Sheets guide
- `workspace://skills/google-slides` — Slides guide

For VS Code Copilot as an MCP client, configure the server in `.vscode/mcp.json`
(see `docs/mcp-clients.md`). The `workspace://context` resource provides the
same behavioral guidance as `WORKSPACE-Context.md`.

