# 🦈 MCP Shark v1.0.0 - Initial Release

> ⚠️ **ALPHA VERSION** - This is an alpha release. The software is under active development and testing. Features may change, and there may be bugs. Use at your own risk.

## 🎉 What is MCP Shark?

MCP Shark is a complete solution for aggregating multiple Model Context Protocol (MCP) servers into one cohesive endpoint, with a real-time web interface for monitoring and inspecting all communications. Think of it as **Wireshark for MCP** - providing deep visibility into every request and response.

## ✨ Key Features

### 🔗 Multi-Server Aggregation

- Connect to multiple MCP servers simultaneously (HTTP and stdio-based)
- Unified API for tools, prompts, and resources from all servers
- Service selection — choose which servers to activate
- Automatic load balancing and failover

### 📊 Real-Time Monitoring & Analysis

- **Live Traffic Capture** — WebSocket-powered real-time updates
- **Wireshark-like Interface** — Detailed packet inspection with frame numbers, timestamps, and protocol information
- **Multiple View Modes**:
  - General list view
  - Grouped by session & server
  - Grouped by server & session
- **Advanced Filtering** — Filter by method, status, protocol, session, server, direction, and more
- **Full-Text Search** — Search across all fields including URLs, endpoints, and JSON-RPC methods

### 🎮 MCP Playground

**Interactive testing environment for exploring and testing MCP servers:**

- **Interactive Tool Testing** — Test any tool from any connected server with custom arguments
- **Prompt Exploration** — Explore and test prompts interactively
- **Resource Browsing** — Browse and read resources from all servers
- **Session Management** — Maintains session state for stateful interactions
- **Real-Time Results** — View formatted output and results in real-time

### 🔍 Smart Scan

**AI-powered security analysis for MCP servers:**

- **Automated Scanning** — Discover and scan multiple MCP servers automatically
- **Security Risk Assessment** — Get overall risk levels (LOW, MEDIUM, HIGH) for each server
- **Detailed Findings** — Comprehensive security analysis including:
  - Tool security analysis
  - Prompt injection risks
  - Resource access patterns
  - Overall security recommendations
- **Batch Scanning** — Scan multiple servers simultaneously
- **Cached Results** — Results are cached for quick access
- **Full Reports** — Access detailed analysis reports at [smart.mcpshark.sh](https://smart.mcpshark.sh)

### 🔌 IDE Integration

**Seamless integration with popular IDEs:**

- **Cursor** — Automatically detects and uses `~/.cursor/mcp.json`
- **Windsurf** — Automatically detects and uses `~/.codeium/windsurf/mcp_config.json`
- **Custom Configurations** — Upload and use any MCP configuration file
- **Zero-Configuration Setup** — Automatic detection, conversion, and setup
- **Automatic Backups** — Creates backups before making any changes

### 📈 Analytics & Statistics

- **Traffic Statistics** — View request counts, unique sessions, and server activity
- **Performance Metrics** — Duration, latency, and timing information for each request
- **Error Tracking** — Comprehensive error logging with stack traces
- **Session Analytics** — Track conversations and stateful interactions

### 💾 Data Management

- **Export Capabilities** — Export captured traffic in JSON, CSV, or TXT formats
- **Backup Management** — Automatic backups of configuration files with restore functionality
- **Log Export** — Export server logs as text files
- **SQLite Database** — Efficient storage with direct database access for advanced analysis

### 🎨 Modern UI/UX

- **Dark Theme** — Developer-friendly dark interface
- **Interactive Tour** — Built-in onboarding guide for first-time users
- **Responsive Design** — Works seamlessly across different screen sizes
  - Adaptive navigation for smaller windows
  - Compact views for mobile and tablet devices
- **Animated Transitions** — Smooth animations for better user experience
- **Multiple View Modes** — Raw, JSON, and Hex views for payload inspection

### ⚙️ Configuration Management

- **Auto-Detection** — Automatically detects IDE configuration files
- **Config Conversion** — Converts IDE config format to MCP Shark format
- **Backup & Restore** — Automatic backups before making changes
- **Config Viewer** — View and inspect configuration files and backups
- **Service Filtering** — Selectively enable/disable specific servers

## 🚀 Quick Start

### Installation

1. **Install dependencies:**

```bash
npm run install:all
```

Or using Make:

```bash
make install-all
```

2. **Start the UI:**

```bash
make start
```

Or using npm:

```bash
npm start
```

3. **Open in browser:**
   Navigate to `http://localhost:9853`

### Zero-Configuration Setup

1. Start MCP Shark UI
2. Select your IDE from the detected list (or upload your config)
3. Choose which servers to enable (optional)
4. Click "Start MCP Shark"
5. Your IDE is now using MCP Shark automatically

No manual configuration editing required - MCP Shark handles everything for you.

## 📋 What's Included

### Core Components

- **MCP Server** — Aggregation layer for multiple MCP servers
- **Web UI** — Real-time monitoring and management interface
- **MCP Playground** — Interactive testing environment
- **Smart Scan** — AI-powered security analysis
- **Audit Logging** — SQLite-based comprehensive logging
- **Configuration Manager** — Automatic IDE config detection and management

### Supported MCP Methods

- `tools/list` — List all tools from all servers
- `tools/call` — Call tools with unified interface
- `prompts/list` — List all prompts from all servers
- `prompts/get` — Get prompt templates
- `resources/list` — List all resources from all servers
- `resources/read` — Read resource contents
- Full support for streaming responses

## 🔧 System Requirements

- **Node.js** 18+ (required)
- **npm** (comes with Node.js)
- **SQLite** (via better-sqlite3, installed automatically)

## 📚 Documentation

- [Full README](./README.md)
- [Developer Guide](./DEVELOPERS.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Setup Instructions](./SETUP.md)

## 🔗 Related Projects

- **[mcp-shark-app](https://github.com/mcp-shark/mcp-shark-app)** - Desktop application (Electron)
- **[mcp-shark-site](https://github.com/mcp-shark/mcp-shark-site)** - Official website
- **[smart-scan-web-app](https://github.com/mcp-shark/smart-scan-web-app)** - Smart Scan web interface

## ⚠️ Important Notes

- **Alpha version** — features may change
- Report issues: [GitHub Issues](https://github.com/mcp-shark/mcp-shark/issues)
- Database location: `~/.mcp-shark/db/mcp-shark.sqlite` (or `%APPDATA%/.mcp-shark/db/` on Windows)
- Configs are automatically backed up before changes

## 🎯 Use Cases

- **Development & Debugging** — Monitor and debug MCP server interactions
- **Testing & QA** — Test tools and prompts before integration
- **Monitoring & Analytics** — Track usage patterns and performance
- **Learning & Exploration** — Discover and understand MCP servers
- **Security Analysis** — Scan servers for potential security risks

## 📝 License

ISC

---

**Built with ❤️ for the MCP community**
