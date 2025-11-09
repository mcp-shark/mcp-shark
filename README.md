# MCP Shark

> **⚠️ ALPHA VERSION - STILL TESTING**  
> This is an alpha version of MCP Shark. The software is still under active development and testing. Features may change, and there may be bugs or incomplete functionality. Use at your own risk.

> **Aggregate multiple Model Context Protocol (MCP) servers into a single unified interface with a powerful monitoring UI**

MCP Shark is a complete solution for aggregating multiple MCP servers (both HTTP and stdio-based) into one cohesive endpoint, with a real-time web interface for monitoring and inspecting all communications.

## Table of Contents

- [What is MCP Shark?](#what-is-mcp-shark)
- [Quick Start](#quick-start)
  - [Installation](#installation)
  - [UI Tabs](#ui-tabs)
- [How to Use](#how-to-use)
  - [Step 1: Open MCP Server Setup](#step-1-open-mcp-server-setup)
  - [Step 2: Select Your Configuration](#step-2-select-your-configuration)
  - [Step 3: Start MCP Shark](#step-3-start-mcp-shark)
  - [Step 4: View Your Traffic](#step-4-view-your-traffic)
  - [Step 5: View Logs](#step-5-view-logs)
- [Advanced Usage](#advanced-usage)
  - [Exporting Traffic](#exporting-traffic)
  - [Managing Backups](#managing-backups)
  - [Stopping the Server](#stopping-the-server)
- [Understanding the Traffic View](#understanding-the-traffic-view)
  - [Columns](#columns)
  - [Filtering](#filtering)
  - [Grouped Views](#grouped-views)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Supported MCP Methods](#supported-mcp-methods)
- [Audit Logging](#audit-logging)
- [Electron App](#electron-app)
- [Additional Resources](#additional-resources)

## What is MCP Shark?

MCP Shark is a powerful tool for monitoring and analyzing Model Context Protocol (MCP) communications. It captures all HTTP requests and responses between your IDE and MCP servers, providing Wireshark-like forensic analysis capabilities.

### Key Features

- **Multi-Server Aggregation**: Connect to multiple MCP servers simultaneously (HTTP and stdio)
- **Real-Time Monitoring**: Live web interface showing all MCP traffic as it happens
- **Advanced Filtering**: Filter traffic by session, server, method, status, and more
- **Multiple View Modes**: View traffic as a flat list, grouped by session, or grouped by server
- **Automatic Config Detection**: Automatically detects and uses your IDE's MCP configuration files
- **Export Capabilities**: Export captured traffic and logs in JSON, CSV, or TXT formats
- **Comprehensive Logging**: SQLite-based logging with request/response tracking and performance metrics

## Quick Start

### Installation

1. **Install dependencies:**

```bash
npm run install:all
```

2. **Start the UI:**

```bash
make start
```

3. **Open your browser:**

Navigate to `http://localhost:9853`

That's it! The interactive tour will guide you through the setup process on first launch.

### UI Tabs

The UI provides three main tabs:

- **Traffic Capture**: Monitor and analyze all MCP traffic in real-time
- **MCP Shark Logs**: View server console output and debug logs
- **MCP Server Setup**: Configure and manage the MCP Shark server

## How to Use

### Step 1: Open MCP Server Setup

When you first open MCP Shark, you'll see an interactive tour. If you've used it before, click the **"Start Tour"** button in the top-right corner to see the guide again.

1. Click on the **MCP Server Setup** tab
2. This is where you'll configure your MCP servers and start monitoring

### Step 2: Select Your Configuration

MCP Shark automatically detects your IDE's MCP configuration files. You have two options:

**Option A: Use a Detected Editor**

- MCP Shark automatically detects configuration files from:
  - **Cursor**: `~/.cursor/mcp.json`
  - **Windsurf**: `~/.codeium/windsurf/mcp_config.json`
- Click on any detected editor (like Cursor or Windsurf) to use its config
- The file path will automatically populate in the text box

**Option B: Select Your Own File**

- Click **"Select File"** to upload your own MCP configuration file
- Choose any valid MCP config file from your system

### Step 3: Start MCP Shark

Once you've selected a configuration file (either from detected editors or uploaded):

1. Click **"Start MCP Shark"** to begin monitoring
2. The server will start and begin capturing all MCP traffic between your IDE and servers
3. You'll see real-time logs in the setup page showing the server status

### Step 4: View Your Traffic

After starting the server, switch to the **Traffic Capture** tab to see all HTTP requests and responses in real-time.

**View Modes:**

- **General List**: Flat list of all requests and responses
- **Grouped by Session & Server**: Group traffic by session ID, then by server name
- **Grouped by Server & Session**: Group traffic by server name, then by session ID

**Features:**

- **Filtering**: Filter by method, status, protocol, session, and more
- **Search**: Search across all fields including URLs, endpoints, and JSON-RPC methods
- **Export**: Export captured traffic in JSON, CSV, or TXT formats
- **Details**: Click any request to see full details including headers, body, and timing

### Step 5: View Logs

Switch to the **MCP Shark Logs** tab to see:

- Server console output
- Configuration backup and restore events
- Error messages and debugging information
- Export logs as text files

### Need Help?

Click the **"Start Tour"** button anytime to restart the interactive guide or get help.

## Advanced Usage

### Exporting Traffic

1. Go to the **Traffic Capture** tab
2. Apply any filters you want (optional)
3. Click the **"Export"** button in the filters section
4. Choose your format:
   - **JSON**: Full structured data
   - **CSV**: Spreadsheet-friendly format
   - **TXT**: Human-readable text format

### Managing Backups

MCP Shark automatically creates backups of your original MCP configuration files before making changes:

1. Go to the **MCP Server Setup** tab
2. Scroll to the **"Backed Up Configuration Files"** section
3. View all available backups with timestamps
4. Click **"Restore"** to restore any backup

### Stopping the Server

1. Go to the **MCP Server Setup** tab
2. Click **"Stop MCP Shark"** (the button changes to "Stop" when the server is running)
3. The server will stop and your original configuration will be restored

## Understanding the Traffic View

### Columns

- **No.**: Frame number (sequential request/response number)
- **Time**: Relative time from first request
- **Date/Time**: Human-readable timestamp
- **Source**: Source address (Client or Server)
- **Destination**: Destination address (Client or Server)
- **Protocol**: Protocol type (HTTP, etc.)
- **Method**: HTTP method (GET, POST, etc.)
- **Status**: HTTP status code (for responses)
- **Endpoint**: JSON-RPC method (e.g., `tools/list`, `prompts/list`)
- **Length**: Packet size in bytes
- **Info**: Summary information

### Filtering

Use the filter bar at the top of the Traffic Capture tab to:

- **Search**: General search across all fields
- **Filter by Method**: HTTP methods (GET, POST, etc.)
- **Filter by Status**: HTTP status codes
- **Filter by Protocol**: Protocol types
- **Filter by Direction**: Request or Response
- **Filter by Session**: Specific session IDs

### Grouped Views

**Grouped by Session & Server:**

- First level: Session IDs
- Second level: Server names within each session
- Useful for tracking conversations within a session

**Grouped by Server & Session:**

- First level: Server names
- Second level: Session IDs within each server
- Useful for seeing all activity from a specific server

## Architecture

```
┌─────────────────┐
│   MCP Client    │
│   (Your IDE)    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────────┐
│   MCP Shark UI (9853)            │
│   - Real-time monitoring         │
│   - Server management            │
│   - Log inspection               │
│   └──► Manages & starts          │
└──────────┬───────────────────────┘
           │ spawns
           ▼
┌─────────────────────────────────┐
│   MCP Shark Server (9851)       │
│   - Aggregates MCP servers      │
│   - Audit logging (SQLite)       │
└─────────────────────────────────┘
```

## Project Structure

```
mcp-shark/
├── mcp-server/           # MCP aggregation server
│   ├── mcp-shark.js      # Main entry point
│   ├── lib/              # Server implementation
│   └── temp/             # Config and database
├── ui/                   # Web UI
│   ├── src/              # React components
│   ├── server.js         # Express server
│   └── dist/             # Built frontend
├── package.json          # Root package.json
└── README.md             # This file
```

## Supported MCP Methods

- `tools/list` - List all tools from all servers
- `tools/call` - Call a tool from any server
- `prompts/list` - List all prompts from all servers
- `prompts/get` - Get a specific prompt
- `resources/list` - List all resources from all servers
- `resources/read` - Read a specific resource

## Audit Logging

All MCP communications are logged to SQLite (default location: `~/.mcp-shark/db/mcp-shark.sqlite`) with:

- **Request/Response Tracking**: Full payload logging with correlation IDs
- **Performance Metrics**: Duration, latency, and timing information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Session Management**: Session ID tracking for stateful interactions
- **Server Identification**: Track which external server handled each request

## Electron App

MCP Shark is also available as a desktop application! See the [mcp-shark-app](https://github.com/mcp-shark/mcp-shark-app) repository for the Electron wrapper that packages MCP Shark into a native desktop application for Windows, macOS, and Linux.

## Additional Resources

- **[DEVELOPERS.md](./DEVELOPERS.md)**: Developer guide and setup instructions
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Guidelines for contributing to the project
- **[LICENSE](./LICENSE)**: License information

---

**Built with the Model Context Protocol SDK**
