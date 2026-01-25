# 🦈 MCP Shark v1.5.11 - Local Static Analysis

## 🎉 What's New in v1.5.11

### 🛡️ Local Static Analysis

New offline security scanning feature with YARA-based detection rules:

- **OWASP MCP Top 10 Detection** — Built-in rules for all MCP security categories (MCP-01 through MCP-10)
- **Agentic Top 10 Detection** — Security checks for agentic AI vulnerabilities (AGENTIC-01 through AGENTIC-10)
- **YARA Rule Engine** — Industry-standard pattern matching for security detection
- **Custom Rules** — Create and manage your own YARA detection rules
- **Analyse Running Servers** — Scans only MCP servers currently connected through the proxy
- **Scan History** — Track and review past analysis results with timestamps and severity breakdown

### 🎨 UI Enhancements

- **Professional Dashboard** — New security dashboard with severity distribution charts
- **Multiple View Modes** — Dashboard, By Severity, By Category, and By Target views
- **Static Analysis Banner** — Quick navigation to AI-powered Smart Scan
- **History Panel** — View and restore historical scan results
- **Neutral Color Palette** — Updated styling with professional gray tones
- **Setup Navigation** — Disabled Analyse button with guidance when no servers running

### 🔧 Architecture Improvements

- **YARA Engine Service** — Dedicated service for YARA rule compilation and matching
- **Rules Manager Service** — Manages predefined and custom detection rules
- **Security Findings Controller** — Refactored to analyse only running proxy servers
- **Removed Discovery Scan** — Deprecated auto-discovery in favor of explicit proxy connections

### 📚 Documentation

- **Local Analysis Guide** — Comprehensive documentation at `docs/local-analysis.md`
- **Updated Features Doc** — Added Local Analysis vs Smart Scan comparison
- **Updated User Guide** — New section covering Local Analysis workflow

### 🧪 Testing

- **ServerManagementService Tests** — Unit tests for `getConnectedServers()` method
- **YARA Module Tests** — Tests for rule compilation and pattern matching
- **Security Scanner Tests** — Coverage for all OWASP detection rules

---

# 🦈 MCP Shark v1.5.9 - UI Improvements & Action Menu

## 🎉 What's New in v1.5.9

### 🎨 UI Enhancements

- **Expandable Action Menu** — New unified menu grouping API docs, help tour, and shutdown buttons
  - Click the menu button (☰) in the bottom-right corner to expand
  - Smooth animations and auto-close functionality
  - Better organization and reduced UI clutter
  - Prevents accidental clicks by grouping related actions

- **Spinner-Based Shutdown** — Replaced countdown timer with animated spinner
  - Uses `IconLoader2` from `@tabler/icons-react` for professional loading indicator
  - Continuous rotation animation during shutdown process
  - Cleaner, more modern visual feedback

### 🔧 Code Quality Improvements

- **Component Refactoring** — Refactored button components for better reusability
  - `ShutdownButton`, `ApiDocsButton`, and `HelpButton` now accept style props
  - Removed code duplication by using components in the action menu
  - Better separation of concerns with button-specific logic in each component

- **Architecture Improvements** — Improved component structure
  - Created `ActionMenu` component to manage expandable menu state
  - Centralized menu behavior (expand/collapse, click outside to close)
  - Consistent styling and animations across all menu items

### 📚 Documentation Updates

- **User Guide** — Added new "UI Controls" section describing the action menu
- **API Reference** — Updated API docs access instructions for new menu
- **Features Documentation** — Updated UI/UX features section
- **README** — Added mention of expandable action menu feature

### 🐛 Bug Fixes

- **Button Visibility** — Fixed shutdown button positioning in expandable menu
- **Style Conflicts** — Resolved positioning conflicts between fixed and absolute positioning
- **Menu Behavior** — Improved menu auto-close and click-outside handling

---

# 🦈 MCP Shark v1.5.7 - Bug Fixes & Code Quality

## 🎉 What's New in v1.5.7

### 🐛 Bug Fixes

- **Stop Server Endpoint** — Fixed `Cannot read properties of undefined` error when stopping the MCP server
  - Injected `configService` into `ServerManagementController` to properly restore original config
  - Server stop endpoint now correctly restores configuration files

### 🧹 Code Quality Improvements

- **Coding Rules Compliance** — Replaced all `let` declarations with `const` to comply with coding standards
  - Refactored `ServerManagementService` to use `const` with ternary expressions
  - Refactored `ServerManagementController` to use `const` for restored flag
  - Refactored WebSocket handler to use object state pattern for timeout management
  - All files now fully comply with "always use const" rule

### 📚 Documentation Updates

- **Release Notes** — Updated with v1.5.7 changes

---

# 🦈 MCP Shark v1.5.6 - MCP Server Status Endpoint

## 🎉 What's New in v1.5.6

### 🔍 MCP Server Status Endpoint

- **New Endpoint** — `GET /api/mcp-server/status` to check if the MCP server (gateway) is running
- **Clear Status Indication** — Returns running status with human-readable messages
- **Traffic Page Guidance** — Helps users know when the MCP gateway is active before focusing on traffic monitoring
- **Better UX** — Provides clear feedback on whether traffic will be captured

**Response Example:**
```json
{
  "running": true,
  "message": "MCP server (gateway) is running and ready to receive traffic"
}
```

### 📚 Documentation Updates

- **API Reference** — Added documentation for the new MCP server status endpoint
- **Swagger/OpenAPI** — Updated with complete endpoint specification and examples

---

# 🦈 MCP Shark v1.5.5 - API Documentation & Developer Experience

## 🎉 What's New in v1.5.5

### 📡 Interactive API Documentation

- **Swagger/OpenAPI Integration** — Complete interactive API documentation with Swagger UI
- **Discovery Button** — Quick access to API docs via satellite button (📡) in the UI
- **Comprehensive Coverage** — All 40+ endpoints documented with request/response schemas
- **Interactive Testing** — Test endpoints directly from the browser
- **Organized by Category** — Endpoints grouped by functionality (Requests, Sessions, Config, etc.)
- **Split Documentation** — OpenAPI specs organized into individual files per endpoint category

### 🔗 URL-Based Tab Navigation

- **Bookmarkable Tabs** — Each tab now has its own URL for direct navigation
- **Shareable Links** — Copy and paste links to specific tabs
- **Browser History** — Back/forward buttons work with tab navigation
- **Hash-Based Routing** — Uses browser History API for seamless navigation

### 🛠️ Package Inspection Tools

- **Pre-Publish Verification** — New npm scripts to inspect package contents before publishing
- **Quick Inspection** — `npm run pack:inspect` shows file count and sample files
- **Full File List** — `npm run pack:list` lists all files in the package
- **Extract for Review** — `npm run pack:extract` extracts package for manual inspection
- **Documentation** — Complete guide in `docs/package-inspection.md`

### 🔌 IDE Integration Enhancements

- **TOML Codex Support** — Full support for Codex's `config.toml` format with `[mcp_servers]` section
- **Automatic Detection** — Automatically detects Codex config files at `~/.codex/config.toml` or `$CODEX_HOME/config.toml`
- **Format Conversion** — Seamlessly converts Codex TOML format to MCP Shark's internal format
- **Unified Config Parser** — New `ConfigParserFactory` supporting TOML, JSON, and legacy JSON formats
- **Multi-Format Support** — Handles stdio and HTTP servers from Codex config with command, args, env, url, and headers

### 🔧 Configuration Management Improvements

- **Config Patching Service** — New dedicated service for handling config file patching
- **Smart Repatching** — Automatically detects and handles already-patched configs
- **Restore Before Setup** — Restores original config before processing to prevent errors
- **Better Error Handling** — Clear error messages for config-related issues

### 🐛 Bug Fixes & Improvements

- **Port Conflict Handling** — Graceful error handling when port 9853 is already in use
- **Shutdown Timeout** — Reduced from 5s to 2s for faster cleanup
- **Modal Components** — Replaced native `confirm()` and `alert()` with proper React modals
- **Business Logic Separation** — Moved export formatting and setup orchestration to services
- **File Organization** — Split large files to comply with size limits

### 📚 Documentation Updates

- **Developer Guide** — Added package inspection section
- **API Reference** — Updated with Swagger/OpenAPI documentation details
- **README** — Updated with API documentation feature
- **Package Inspection Guide** — New comprehensive guide for package verification

### 🏗️ Architecture Improvements

- **Service Layer** — New `ExportService` for export formatting logic
- **Service Layer** — Enhanced `ServerManagementService` with setup orchestration
- **Controller Simplification** — Controllers now only handle HTTP concerns
- **Better Separation of Concerns** — Strict adherence to architecture rules

---

# 🦈 MCP Shark v1.5.0 - Documentation & Stability Improvements

## 🎉 What's New in v1.5.0

### 📚 Comprehensive Documentation Restructure

- **New Documentation System** — Complete documentation split into organized sections in `docs/` folder
- **Desktop App First** — README now prioritizes desktop application downloads for better marketing
- **Professional Documentation** — 8 comprehensive guides covering all aspects of MCP Shark:
  - Getting Started Guide
  - Features Documentation
  - User Guide
  - Architecture Documentation
  - API Reference
  - Configuration Guide
  - Troubleshooting Guide
  - Development Guide
- **Improved README** — Concise, professional README (154 lines vs 912 lines) with clear navigation

### 🐛 Critical Bug Fixes

- **Playground Infinite Loops** — Fixed continuous refreshing and infinite request loops in MCP Playground
- **Statistics Polling** — Resolved excessive status calls that prevented tools/resources from loading
- **Session Management** — Fixed session ID handling to prevent callback recreation loops
- **Server Status** — Improved server status checking to prevent unnecessary re-renders

### 🔧 Technical Improvements

- **Unified Logger** — Implemented shared logger using `consola` across entire codebase
- **Settings Endpoint** — New `/api/settings` endpoint exposing all application paths and configuration
- **Start Script Refactoring** — Pure Node.js start script without shell commands or process execution
- **Code Compliance** — All files now comply with coding rules (0 linting violations)
- **File Organization** — Split large files to comply with size limits (backend: 250 lines, frontend: 300 lines)

### 🎮 Playground Enhancements

- **Stable Data Loading** — Fixed infinite loops in data loading hooks
- **Memoized Callbacks** — Proper use of `useCallback` to prevent unnecessary re-renders
- **Ref-based State** — Used refs for state values that shouldn't trigger effects
- **Improved UX** — Playground now loads tools, prompts, and resources reliably

### 📦 Package Improvements

- **npx Support** — Enhanced npx usage with `--open` flag support
- **Pre-start Hook** — Added `prestart` script for automatic UI build
- **Better Error Handling** — Improved error messages and user feedback

### 🧹 Code Quality

- **Zero Lint Disables** — Removed all lint disable comments, fixed all issues properly
- **Coding Rules Compliance** — All files follow strict coding standards
- **Accessibility** — Improved accessibility with semantic HTML and ARIA labels
- **React Best Practices** — Proper hook dependencies and memoization throughout

---

# 🦈 MCP Shark v1.4.2 - Playground Improvements

## 🎉 What's New in v1.4.2

### 🎮 MCP Playground Enhancements

- **Per-Server Routing Support** — Fixed 404 errors by implementing proper per-server routing (`/mcp/{serverName}`)
- **Server Selector UI** — Added clickable button list for easy server selection
- **Improved List Items** — Enhanced tools, prompts, and resources lists with card-style design and better hover states
- **Better Error Handling** — Fixed "No server selected" errors and improved error messages
- **Code Quality** — Refactored playground hooks into smaller, more maintainable modules (all files under 300 LOC)

### 🐛 Bug Fixes

- Fixed MCP playground 404 error when connecting to servers
- Resolved circular dependency issues in playground hooks
- Fixed server selection not updating tools/prompts/resources lists
- Improved session management when switching between servers

### 🔧 Technical Improvements

- Split `useMcpPlayground` hook into focused modules:
  - `useMcpRequest` — MCP request logic and session management
  - `useMcpServerStatus` — Server status checking and server list management
  - `useMcpDataLoader` — Data loading for tools, prompts, and resources
- Added `/api/composite/servers` endpoint to get available servers
- Enhanced playground UI with better visual feedback and interactions

---

# 🦈 MCP Shark v1.4.0 - npm Package Release

## 🎉 What's New in v1.4.0

### 📦 npm Package Release

MCP Shark is now available as an npm package! Install and run it with a single command:

```bash
npm install -g mcp-shark
mcp-shark
```

Or use npx (no installation required):

```bash
npx mcp-shark
```

### ✨ Key Improvements

- **npm Package**: Now available on npm registry for easy installation
- **Simplified Installation**: One-command install and run
- **Automatic Setup**: Dependencies and UI build automatically on first run
- **Enhanced Documentation**: Comprehensive README with npm installation instructions
- **License Update**: Updated to Source-Available Non-Commercial License

### 🔧 Technical Changes

- Updated package.json with proper npm metadata
- Enhanced bin script for automatic dependency installation
- Improved error handling and user feedback
- Better documentation structure with table of contents

### 📚 Documentation Updates

- Complete npm installation guide
- Updated README with all current features
- Added comprehensive table of contents
- Updated license information

---

# 🦈 MCP Shark v1.0.0 - Initial Release

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
