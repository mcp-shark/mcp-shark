# User Guide

Complete guide to using MCP Shark's features and capabilities.

## UI Tabs Overview

MCP Shark's interface is organized into five main tabs, each providing different functionality.

### Traffic Capture

The main monitoring interface with Wireshark-like capabilities for inspecting MCP communications.

**Real-time Updates:**
- WebSocket-powered live traffic capture
- Automatic updates as requests and responses occur
- Statistics refresh every 2 seconds

**View Modes:**
- **General List**: Flat chronological view of all traffic
- **Grouped by Session & Server**: Organize by conversation sessions
- **Grouped by Server & Session**: Organize by server activity
- **Protocol View**: View traffic by protocol type

**Advanced Filters:**
- **Search**: Full-text search across all fields
- **HTTP Method**: Filter by GET, POST, etc.
- **Status Code**: Filter by HTTP status codes
- **Protocol**: Filter by protocol type
- **Direction**: Filter by Request/Response
- **Session ID**: Filter by specific session
- **Server Name**: Filter by server name
- **JSON-RPC Method**: Filter by MCP method name
- **JSON-RPC ID**: Filter by request ID

**Packet Details:**
Click any packet to see:
- Full request/response headers
- Request/response body
- Timing information (duration, latency)
- JSON-RPC details
- Raw, JSON, and Hex views
- Network information

**Export:**
- Export filtered results in JSON, CSV, or TXT formats
- Export includes all metadata and timing information

**Statistics:**
- View traffic statistics including request counts
- Unique session tracking
- Server activity metrics
- Protocol distribution

### MCP Playground

Interactive testing environment for MCP servers.

**Tools Section:**
- Browse all available tools from all servers
- View tool descriptions, parameters, and schemas
- Call tools with custom JSON arguments
- View results in real-time with formatted output
- Test different parameter combinations

**Prompts Section:**
- List all prompts from all servers
- View prompt descriptions and argument schemas
- Test prompts with different arguments
- View formatted prompt results

**Resources Section:**
- Browse available resources
- Read resource contents directly in the UI
- Explore resource URIs and metadata

**Session Management:**
- Automatic session tracking
- Maintains context across multiple tool calls
- Test stateful workflows

**Server Selection:**
- Choose which server to test
- Switch between servers dynamically
- View server status and availability

### Smart Scan

AI-powered security analysis for MCP servers.

**Server Discovery:**
- Automatically discover MCP servers from your configuration
- View all available servers
- Select which servers to scan

**Batch Scanning:**
- Scan multiple servers simultaneously
- Monitor scan progress in real-time
- View scan status and results

**Risk Assessment:**
- Overall risk levels (LOW, MEDIUM, HIGH) for each server
- Quick visual indicators
- Detailed security findings

**Results View:**
- Compact single-row display for scan results
- Server name and risk level badge
- Quick "view results" button to access full reports
- Status indicators (Cached, Success)

**Full Reports:**
- Click "view results" to see complete analysis
- Opens detailed reports at [https://smart.mcpshark.sh](https://smart.mcpshark.sh)
- Comprehensive security analysis with findings and recommendations
- Historical scan results and comparisons

**Cached Results:**
- Results are cached for quick access
- No need to re-scan unless configuration changes
- Clear cache option available

### MCP Shark Logs

Server console output and debugging information.

**Real-time Logs:**
- See server output as it happens
- Auto-scroll to latest logs
- Color-coded by log type

**Log Filtering:**
- Filter by log type (stdout, stderr, error)
- Search within logs
- Clear logs when needed

**Export Logs:**
- Export logs as text files
- Includes all log entries with timestamps

### MCP Server Setup

Configuration and server management.

**Config Detection:**
- Automatically detects config files from:
  - Cursor: `~/.cursor/mcp.json`
  - Windsurf: `~/.codeium/windsurf/mcp_config.json`
- Shows detected paths and file status

**File Upload:**
- Upload your own MCP configuration file
- Supports standard MCP configuration formats

**Service Selection:**
- Choose which servers to enable
- Select all or individual servers
- View server configurations

**Config Viewer:**
- View and inspect configuration files
- View backup contents
- Compare configurations

**Start/Stop Server:**
- Control the MCP Shark server
- View server status
- Start/stop with one click

**Backup Management:**
- View all backups with timestamps
- Restore any backup
- Delete backups
- View backup contents
- See backup file sizes and locations

**Settings:**
- View all application settings
- Database path and status
- Smart Scan token information
- Backup directories and counts
- Configuration file paths

## Advanced Features

### Exporting Data

**Traffic Export:**

1. Go to **Traffic Capture** tab
2. Apply any filters (optional)
3. Click **Export** button
4. Choose format:
   - **JSON**: Full structured data with all metadata
   - **CSV**: Spreadsheet-friendly format
   - **TXT**: Human-readable text format

**Log Export:**

1. Go to **MCP Shark Logs** tab
2. Click **Export Logs** button
3. Logs are exported as a text file

### Backup Management

MCP Shark automatically creates backups before modifying your configuration.

**View Backups:**

1. Go to **MCP Server Setup** tab
2. Scroll to **"Backed Up Configuration Files"** section
3. View all backups with:
   - Original file path
   - Backup location
   - Creation timestamp
   - File size

**Backup Actions:**

- **View**: Inspect backup contents
- **Restore**: Restore backup to original location
- **Delete**: Remove backup file

### Session Management

**Automatic Session Tracking:**
- Sessions are automatically tracked and displayed
- Each session has a unique ID
- Sessions persist across requests

**Session Filtering:**
- Filter traffic by specific session IDs
- View all sessions in the statistics

**Session Grouping:**
- View traffic grouped by session for conversation analysis
- Understand conversation flow and context

**Session Persistence:**
- Sessions are maintained across requests
- Stateful interactions are preserved
- Session context is available in the Playground

### Performance Analysis

Each request/response includes detailed performance metrics:

- **Duration**: Total request/response time
- **Latency**: Network latency measurements
- **Payload Size**: Request and response sizes
- **Status Codes**: HTTP status codes
- **Timing Breakdown**: Detailed timing information

View performance data in the packet details panel.

## Keyboard Shortcuts

- **Escape**: Close modals and dialogs
- **Enter/Space**: Activate buttons and interactive elements
- **Tab**: Navigate between elements

## Best Practices

1. **Regular Backups**: MCP Shark creates automatic backups, but consider additional backups for important configurations
2. **Filter Usage**: Use filters to focus on specific traffic patterns
3. **Export Regularly**: Export important traffic data for analysis
4. **Security Scanning**: Run Smart Scan regularly to identify potential security issues
5. **Session Analysis**: Use session grouping to understand conversation flows
6. **Playground Testing**: Test tools and prompts in the Playground before using them in production

## Tips

- Use the interactive tour on first launch to learn the interface
- Export filtered results for offline analysis
- Use Smart Scan to identify security risks before deployment
- Test tools in the Playground to understand their behavior
- Monitor statistics to track usage patterns
- Use session grouping to analyze conversation flows

