# Using with Other MCP Clients

The Google Workspace MCP server speaks standard
[Model Context Protocol](https://modelcontextprotocol.io/) over stdio, so it
works with any MCP-compatible agent — not just Gemini CLI.

## Prerequisites

All agents require the same setup:

1. **Node.js ≥ 20** installed
2. **Clone and build the server:**
   ```bash
   git clone https://github.com/gemini-cli-extensions/workspace.git
   cd workspace
   npm install && npm run build
   ```
3. **Authenticate with Google:**
   ```bash
   node scripts/auth-utils.js login
   ```
   Follow the printed URL to sign in. On headless/SSH environments, paste the
   credentials JSON when prompted. See the
   [authentication docs](development.md#authentication) for full details.

> **Note for Windows users:** Use backslashes in paths within JSON config files,
> e.g. `C:\\Users\\you\\workspace\\workspace-server\\dist\\index.js`.

## Tool Naming

By default the server uses **underscore notation** for tool names (e.g.,
`docs_create`, `gmail_search`). This is the format expected by all agents below.

> **Gemini CLI only:** The `--use-dot-names` flag switches to dot notation
> (`docs.create`). Do not pass this flag when using other agents.

## Behavioral Guidance and Skills

Gemini CLI activates per-service skill files automatically. For other agents,
equivalent guidance is available as **MCP resources** served by the server:

| Resource URI | Contents |
|---|---|
| `workspace://context` | Core behavioral guide (best practices, formatting, error handling) |
| `workspace://skills/gmail` | Gmail composition, HTML email, search syntax |
| `workspace://skills/google-docs` | Two-step create-then-format workflow |
| `workspace://skills/google-calendar` | Timezone-first workflow, ISO 8601 requirements |
| `workspace://skills/google-chat` | Supported markdown syntax |
| `workspace://skills/google-sheets` | Spreadsheet querying and ranges |
| `workspace://skills/google-slides` | Text extraction, images, thumbnails |

Load `workspace://context` at the start of each session. Load a skill resource
before working with a specific service.

For agents that don't support MCP resources, you can paste the contents of
[AGENT-CONTEXT.md](https://github.com/gemini-cli-extensions/workspace/blob/main/AGENT-CONTEXT.md)
as a system prompt.

---

## Claude Desktop

**Config file:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following to your config (replace the path with the absolute path to
your cloned repo):

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after saving. The `google-workspace` server will appear
in the Claude UI. Claude Desktop supports MCP resources — load
`workspace://context` at the start of your session.

---

## GitHub Copilot CLI

**Config files** (merged in priority order, highest first):
1. `.copilot/mcp-config.json` — project/repo level (commit this to share with your team)
2. `~/.copilot/mcp-config.json` — user level (applies to all projects)
3. `.vscode/mcp.json` — also read as a fallback

**Recommended:** add `.copilot/mcp-config.json` to the repo root so the server
is available whenever you open the repo in Copilot CLI.

```json
{
  "mcpServers": {
    "google-workspace": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"]
    }
  }
}
```

If your Copilot CLI build supports `${workspaceFolder}` interpolation, you can
use:
`"args": ["${workspaceFolder}/workspace-server/dist/index.js"]`.
If interpolation is not supported in your environment, use an absolute path.

Use `/mcp` inside a Copilot CLI session to list, add, or refresh MCP servers
without restarting. After adding the config file, run `/mcp` to confirm
`google-workspace` appears in the list.

> Copilot CLI also reads `CLAUDE.md` and `GEMINI.md` from the repo root — both
> files exist in this repo and provide development guidance automatically.

---

## GitHub Copilot (VS Code)

**Config file:**
- Workspace: `.vscode/mcp.json` (commit this to share with your team — also read by Copilot CLI as a fallback)
- User-level: `%APPDATA%\Code\User\mcp.json` (Windows) or
  `~/.config/Code/User/mcp.json` (macOS/Linux)

> **Schema difference:** VS Code Copilot uses `"servers"` (not `"mcpServers"`)
> while Copilot CLI uses `"mcpServers"`. Both require `"type": "stdio"`. Keep
> separate files if you want both to work reliably.

```json
{
  "servers": {
    "google-workspace": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/workspace-server/dist/index.js"]
    }
  }
}
```

If `${workspaceFolder}` is not expanded by your extension version, fall back to
an absolute path.

Alternatively, run **MCP: Open User Configuration** from the VS Code Command
Palette to open or create the file.

---

## Cursor

**Config file:**
- Global: `~/.cursor/mcp.json` (macOS/Linux) or `%APPDATA%\Cursor\mcp.json` (Windows)
- Project: `.cursor/mcp.json` (project-level, takes priority over global)

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"]
    }
  }
}
```

Restart Cursor after saving. Project-level configs override global ones.

---

## Cline

Cline stores MCP server configuration in a dedicated settings file managed by
the VS Code extension:

- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

**Recommended:** Use the Cline UI to add the server:
1. Click the **MCP Servers** icon in the Cline sidebar
2. Select the **Configure** tab → **Configure MCP Servers**
3. Add the following entry:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

---

## Continue.dev

**Config file:**
- macOS/Linux: `~/.continue/config.json`
- Windows: `%USERPROFILE%\.continue\config.json`
- Project-level: `.continue/config.json`

Add a `mcpServers` block to your existing config:

```json
{
  "mcpServers": [
    {
      "name": "google-workspace",
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"]
    }
  ]
}
```

---

## Windsurf

**Config file:**
- macOS/Linux: `~/.codeium/windsurf/mcp_config.json`
- Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

You can open this file from within Windsurf: click the MCP icon in the toolbar
and select **Configure**. Add the following:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/absolute/path/to/workspace/workspace-server/dist/index.js"]
    }
  }
}
```

Restart Windsurf after saving.

---

## Troubleshooting

**Server doesn't appear after configuration:**
- Ensure the path to `dist/index.js` is absolute, not relative
- Verify the build succeeded: `ls workspace-server/dist/index.js`
- Check that Node.js ≥ 20 is on your PATH

**Authentication errors (`{"error":"invalid_request"}`):**
- Run `node scripts/auth-utils.js status` to check credential status
- Run `node scripts/auth-utils.js clear` then re-authenticate with `node scripts/auth-utils.js login`

**Tools not listed:**
- Some agents require a restart after adding MCP servers
- Verify the server starts correctly: `node workspace-server/dist/index.js`
  (it should print a ready message to stderr)
