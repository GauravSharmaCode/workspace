# Plan: Make Google Workspace Extension Agent-Agnostic

## Problem Statement

The MCP server (`workspace-server/`) already speaks standard MCP over stdio and is fully agent-agnostic at the protocol level. However, all installation docs, the README, and supporting files assume Gemini CLI as the only client. Additionally, other agents cannot benefit from the rich behavioral guidance in `skills/` and `WORKSPACE-Context.md` since those are loaded by Gemini's native skills system.

We need to:
1. Document how to connect this server to other major MCP-capable agents
2. Make the skills/behavioral guidance accessible to those agents via their native mechanisms

## How Skills Work Today (Gemini) vs. Other Agents

| Layer | Gemini CLI | Other agents |
|---|---|---|
| MCP server config | `gemini-extension.json` | Agent-specific config file/settings |
| Behavioral context | `WORKSPACE-Context.md` (auto-loaded) | Agent instruction file (CLAUDE.md, .cursorrules, etc.) |
| Contextual skills | `skills/*/SKILL.md` (auto-activated by Gemini) | MCP Resources (served by server) + agent instruction files |

## Approach

Three-pronged strategy:

### 1. MCP Resources (server-side, ~1 file change)
Add MCP resource handlers to `workspace-server/src/index.ts` to expose behavioral content that any resource-capable agent can load:
- `workspace://context` → contents of `WORKSPACE-Context.md`
- `workspace://skills/{name}` → contents of each `skills/*/SKILL.md` (gmail, google-docs, google-calendar, google-chat, google-sheets, google-slides)

This is a small addition to `index.ts` using the existing `@modelcontextprotocol/sdk`. The resources are read from the filesystem at runtime (paths relative to the built binary).

### 2. Agent-Specific Instruction Files (new files)
Create instruction files for each major agent at the repo root or standard paths. These files contain the consolidated behavioral guidance from `WORKSPACE-Context.md` + skill highlights, adapted for each agent's format:

| Agent | File |
|---|---|
| Claude Desktop / Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/google-workspace.md` |
| Cline | `.clinerules` |
| Windsurf | `.windsurfrules` |
| VS Code Copilot | `.github/copilot-instructions.md` (already exists — update) |
| Continue.dev | Documented in `docs/mcp-clients.md` as a system prompt paste |

Content strategy: Rather than copy/pasting all skill content into every file (unmaintainable), create a **single `AGENT-CONTEXT.md`** at the repo root as the canonical consolidated behavioral guide for non-Gemini agents. Agent-specific files reference this file and add any agent-specific setup notes. 

### 3. Installation Docs (new docs page)
Create `docs/mcp-clients.md` covering all 6 agents with:
- Prerequisites + build + auth (shared section)
- Per-agent: MCP config snippet, how behavioral context is loaded, tool naming note

## Agents to Cover

1. **Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) / `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
2. **VS Code Copilot** — `.vscode/mcp.json` or workspace settings
3. **Cursor** — `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project)
4. **Cline** — VS Code extension MCP settings
5. **Continue.dev** — `~/.continue/config.json` mcpServers block
6. **Windsurf** — `~/.codeium/windsurf/mcp_config.json`

## Key Technical Notes (for all docs)

- **Tool naming**: By default the server uses underscore format (`docs_create`). The `--use-dot-names` flag is Gemini-only. All other agents work with the default.
- **Auth**: All agents use the same `node scripts/auth-utils.js login` flow.
- **Prerequisites**: Node.js ≥ 20, repo cloned + `npm install && npm run build`.
- **MCP Resources**: Agents that support resource loading (Claude Desktop, Cline) can load skills on demand. Those that don't will rely on the agent instruction file.

## Todos

1. Research exact MCP config file paths/format for all 6 agents (and resource loading support per agent)
2. Add MCP resource handlers to `workspace-server/src/index.ts` (serve WORKSPACE-Context.md + skills as resources)
3. Add tests for MCP resource serving (in `workspace-server/src/__tests__/`)
4. Create `AGENT-CONTEXT.md` — consolidated behavioral guide (no Gemini-specific references)
5. Create agent instruction files: `CLAUDE.md`, `.cursor/rules/google-workspace.md`, `.clinerules`, `.windsurfrules`; update `.github/copilot-instructions.md`
6. Create `docs/mcp-clients.md` with per-agent setup guide (config + behavioral context + tool naming)
7. Update `README.md` — add "Other MCP Clients" section, link to `docs/mcp-clients.md`
8. Update `docs/index.md` — link to new page
9. Update `docs/.vitepress/config.*` — add `mcp-clients.md` to sidebar/nav

## Not Changing

- `gemini-extension.json`, `commands/`, `skills/`, `WORKSPACE-Context.md`, `GEMINI.md` — Gemini support stays as-is
- Release artifact (tarball) — Gemini-specific, no change needed
- Token storage names, env vars — out of scope
