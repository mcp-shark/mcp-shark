# Configuration

Guide to configuring MCP Shark and MCP servers.

## Automatic Configuration

The web UI's **MCP Server Setup** tab probes three IDEs for live configuration:

- **Cursor** — `~/.cursor/mcp.json`
- **Windsurf** — `~/.codeium/windsurf/mcp_config.json`
- **Codex** — `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`)

The detected file is converted to MCP Shark's internal format and shown in the UI for review.

> The CLI (`mcp-shark scan`, `list`, `doctor`) recognises a much wider set of IDE
> config paths — see the table in the [README](../README.md#supported-ide-configurations)
> for the full list of 15+ locations it scans automatically.

## Supported Formats

MCP Shark supports multiple configuration formats:

- **JSON**: Standard MCP configuration format (used by Cursor, Windsurf)
- **TOML**: Codex configuration format (`config.toml`)

## Manual Configuration

If you need to configure manually, create a file at `~/.mcp-shark/mcps.json`:

### HTTP Server Configuration

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

### stdio Server Configuration

```json
{
  "servers": {
    "@21st-dev/magic": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    }
  }
}
```

## Codex Integration

Full support for Codex's `config.toml` format:

```toml
[mcp_servers]
server_name = { command = "node", args = ["server.js"], env = { KEY = "value" } }
http_server = { url = "https://api.example.com", headers = { Authorization = "Bearer token" } }
```

MCP Shark automatically:
- Detects Codex `config.toml` files
- Parses the `[mcp_servers]` section
- Converts to internal format (supports both stdio and HTTP servers)
- Handles environment variables and headers

## Configuration File Format

### Server Types

**HTTP Server:**
```json
{
  "name": {
    "type": "http",
    "url": "https://example.com/mcp",
    "headers": {
      "Authorization": "Bearer token"
    }
  }
}
```

**stdio Server:**
```json
{
  "name": {
    "type": "stdio",
    "command": "node",
    "args": ["path/to/server.js"],
    "env": {
      "API_KEY": "value"
    }
  }
}
```

## Service Selection

You can selectively enable or disable specific servers:

1. Go to **MCP Server Setup** tab
2. Select your configuration file
3. Choose which servers to enable
4. Click **"Start MCP Shark"**

Only enabled servers will be available through MCP Shark.

## Backup Management

MCP Shark automatically creates backups before modifying configuration files.

**Backup Locations:**

Backups are written next to the original config file as a hidden file with a
`-mcpshark.<datetime>.json` suffix (and the `.backup` legacy form is still recognised
for restore). The UI's **MCP Server Setup → Backups** view discovers them in:

- Cursor: `~/.cursor/.mcp.json-mcpshark.YYYY-MM-DD_HH-MM-SS.json`
- Windsurf: `~/.codeium/windsurf/.mcp_config.json-mcpshark.YYYY-MM-DD_HH-MM-SS.json`

> Codex `config.toml` patching is not yet covered by the backup discovery view —
> if you want a snapshot of `~/.codex/config.toml` keep your own copy until that
> support lands.

**Backup Actions:**
- View all backups in the **MCP Server Setup** tab
- Restore any backup to its original location
- Delete backups when no longer needed
- View backup contents for inspection

## Settings Endpoint

Access all configuration paths and settings via the settings API:

**Endpoint:** `GET /api/settings`

Returns:
- Working directory path
- Database path
- Smart Scan results directory
- Smart Scan token path and status
- Backup directories and counts
- Configuration file paths
- System information

## Environment Variables

MCP Shark reads the following environment variables at startup:

| Variable | Purpose | Default |
|----------|---------|---------|
| `UI_PORT` | UI server port (the port your browser connects to) | `9853` |
| `MCP_SHARK_PORT` | Alias for `UI_PORT`. Honoured if `UI_PORT` is unset. | `9853` |
| `MCP_SHARK_SERVER_PORT` | Internal MCP aggregation server port | `9851` |
| `MCP_SHARK_HOME` | Override the working directory used for the database, config, backups, and tokens | `~/.mcp-shark` |
| `CODEX_HOME` | Override the Codex config root scanned by the CLI/UI | `~/.codex` |

Both port variables are honoured by the standalone server (`npx @mcp-shark/mcp-shark serve`)
and the legacy launcher (`npx mcp-shark --open`). `MCP_SHARK_HOME` controls every
on-disk location that defaults to `~/.mcp-shark` — database, MCP config, and the
Smart Scan token file.

## Smart Scan Configuration

Smart Scan requires an API token for security analysis.

**Token Storage:**
- Location: `~/.mcp-shark/smart-scan-token.json`
- Format: JSON with `token` and `updatedAt` fields

**Setting the Token:**
1. Go to **Smart Scan** tab
2. Enter your API token
3. Token is saved automatically

**Token Management:**
- View token status in **MCP Server Setup** → **Settings**
- Token is stored securely in the working directory
- Token is required for Smart Scan functionality

## Database Configuration

**Default Location:**
- `~/.mcp-shark/db/mcp-shark.sqlite`

**Database Management:**
- Database is created automatically on first run
- All traffic is logged to the database
- Database can be accessed directly for advanced analysis
- Export data through the UI in JSON, CSV, or TXT formats

## IDE Integration

The web UI's **MCP Server Setup** flow integrates with three IDEs:

**Cursor:**
- Detects: `~/.cursor/mcp.json`
- Updates configuration to point to MCP Shark
- Creates backup before modification
- Restores original on stop

**Windsurf:**
- Detects: `~/.codeium/windsurf/mcp_config.json`
- Converts Windsurf format to MCP Shark format
- Creates backup before modification
- Restores original on stop

**Codex:**
- Detects: `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`)
- Parses `[mcp_servers]` and converts to internal format
- Patching to route Codex through the proxy is best-effort

**Custom Configuration:**
- Upload any MCP configuration file
- MCP Shark will convert and use it

> The CLI (`scan`, `list`, `doctor`) recognises a much wider set of IDE config
> paths for read-only scanning — see the [README's Supported IDE configurations
> table](../README.md#supported-ide-configurations) for the full list.

## Configuration Validation

MCP Shark validates configuration files before use:

- JSON syntax validation
- Required fields checking
- Server type validation
- URL and command validation

Invalid configurations will show error messages in the UI.

## Troubleshooting Configuration

**Common Issues:**
- Invalid JSON syntax
- Missing required fields
- Incorrect server URLs
- Unavailable stdio commands

**Solutions:**
- Check JSON syntax with a validator
- Verify all required fields are present
- Test server URLs and commands manually
- Review error messages in the UI

For more troubleshooting help, see the [Troubleshooting Guide](troubleshooting.md).

