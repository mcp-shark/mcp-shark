# Configuration

Guide to configuring MCP Shark and MCP servers.

## Automatic Configuration

MCP Shark automatically detects and converts configuration files from:

- **Cursor** — `~/.cursor/mcp.json`
- **Windsurf** — `~/.codeium/windsurf/mcp_config.json`

The UI will show detected configuration files and allow you to select which one to use.

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
- Cursor backups: `~/.cursor/.mcp.json-mcpshark.YYYY-MM-DD_HH-MM-SS.json`
- Windsurf backups: `~/.codeium/windsurf/.mcp_config.json-mcpshark.YYYY-MM-DD_HH-MM-SS.json`

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

MCP Shark uses the following environment variables:

- `MCP_SHARK_HOME`: Override the default working directory (default: `~/.mcp-shark`)
- `MCP_SHARK_PORT`: Override the UI server port (default: 9853)
- `MCP_SHARK_SERVER_PORT`: Override the MCP server port (default: 9851)

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

MCP Shark automatically integrates with supported IDEs:

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

**Custom Configuration:**
- Upload any MCP configuration file
- MCP Shark will convert and use it
- Backup is created automatically

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

