# Google Workspace MCP Server — Behavioral Guide

This guide provides behavioral instructions for effectively using the Google
Workspace MCP server. For detailed parameter documentation, refer to the tool
descriptions in the server itself.

## Core Principles

### 1. User Context First

**Always establish user context at the beginning of interactions:**

- Use `people_getMe()` to understand who the user is
- Use `time_getTimeZone()` to get the user's local timezone
- Apply this context throughout all interactions
- All time-based operations should respect the user's timezone

### 2. Safety and Transparency

**Never execute write operations without explicit confirmation:**

- Preview all changes before executing
- Show complete details in a readable format
- Wait for clear user approval
- Give users the opportunity to review and cancel

### 3. Smart Tool Usage

**Choose the right approach for each task:**

- Tools automatically handle URL-to-ID conversion — don't extract IDs manually
- Batch related operations when possible
- Use pagination for large result sets
- Apply appropriate formats based on the use case

## Output Formatting Standards

### Lists and Search Results

Always format multiple items as **numbered lists** for better readability:

✅ **Correct:**

```
Found 3 documents:
1. Budget Report 2024
2. Q3 Sales Presentation
3. Team Meeting Notes
```

❌ **Incorrect:**

```
Found 3 documents:
- Budget Report 2024
- Q3 Sales Presentation
- Team Meeting Notes
```

### Write Operation Previews

Before any write operation, show a clear preview:

```
I'll create this calendar event:

Title: Team Standup
Date: January 15, 2025
Time: 10:00 AM - 10:30 AM (EST)
Attendees: team@example.com

Should I create this event?
```

## Tool Naming

By default the server exposes tools using **underscore notation** (e.g.,
`docs_create`, `gmail_search`). The tool descriptions in your agent will show
the correct names automatically.

## Multi-Tool Workflows

### Creating and Organizing Documents

When creating documents in specific folders:

1. Create the document with `docs_create` (blank)
2. Move it to the target folder with `drive_moveFile`
3. Confirm successful completion

To find Google Docs, Sheets, or Slides, use `drive_search` with a MIME type
filter rather than searching by name alone. Example MIME type queries:

- Docs: `mimeType='application/vnd.google-apps.document' and name contains 'query'`
- Sheets: `mimeType='application/vnd.google-apps.spreadsheet' and name contains 'query'`
- Slides: `mimeType='application/vnd.google-apps.presentation' and name contains 'query'`

## Error Handling

### Authentication Errors

- If any tool returns `{"error":"invalid_request"}`, it likely indicates an
  expired or invalid session.
- **Action:** Call `auth_clear` to reset credentials and force a re-login.

### Graceful Degradation

- If a folder doesn't exist, offer to create it
- If search returns no results, suggest alternatives
- If permissions are insufficient, explain clearly

### Validation Before Action

- Verify file/folder existence before moving
- Check calendar availability before scheduling
- Validate email addresses before sending

## Common Pitfalls to Avoid

- ❌ Try to extract IDs manually from URLs — tools accept URLs directly
- ❌ Assume timezone without checking via `time_getTimeZone`
- ❌ Execute write operations without preview and confirmation
- ❌ Create files unless explicitly requested
- ❌ Use relative paths for file downloads

## Session Management

### Beginning of Session

1. Get user profile with `people_getMe()`
2. Get timezone with `time_getTimeZone()`
3. Establish any relevant context

### End of Session

- Confirm all requested tasks completed
- Provide summary if multiple operations performed
- Ensure no pending confirmations

## Service-Specific Guidance

### Google Docs

Use a **two-step workflow** for richly formatted documents:

1. **Insert content** using `docs_create` or `docs_writeText` — inserts plain text
2. **Apply formatting** using `docs_formatText` — applies bold, italic, headings, links

Indices are 1-based. Calculate character positions carefully, counting newlines.

Multiple styles can stack: apply both `heading2` and `bold` to the same range.

### Gmail

When composing emails (via `gmail_send` or `gmail_createDraft`), **always use
HTML formatting with `isHtml: true`** unless the user explicitly requests plain
text. Rich HTML emails look professional and are the standard for business
communication.

Use `gmail_search` with Gmail search syntax (e.g., `from:someone@example.com`,
`is:unread`, `subject:meeting`).

### Google Calendar

**Always call `time_getTimeZone()` before any calendar operation.** Use the
returned timezone for all event creation and display. ISO 8601 datetimes must
include a timezone offset (e.g., `2025-01-15T10:30:00-05:00`) — never send
"bare" datetimes without an offset.

Always pass `calendarId: "primary"` on every calendar tool call that accepts a
`calendarId` parameter.

### Google Chat

When composing messages (via `chat_sendMessage` or `chat_sendDm`), use Google
Chat's supported markdown syntax. Use `**bold**`, `_italic_`, `` `code` ``, and
```` ```code blocks``` ```` — do NOT use standard markdown like `# headings` or
`---` dividers, which are not supported.

### Google Sheets

Use `sheets_getText` for an overview of spreadsheet content, and `sheets_getRange`
for specific data ranges. MIME type filter for finding sheets:
`mimeType='application/vnd.google-apps.spreadsheet'`

### Google Slides

Use `slides_getText` to extract all text. For images, use `slides_getImages`
to download all embedded images to a local directory. Use
`slides_getSlideThumbnail` for a single slide's thumbnail. MIME type filter
for finding presentations:
`mimeType='application/vnd.google-apps.presentation'`
