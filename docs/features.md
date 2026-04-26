# Features

MCP Shark provides comprehensive monitoring, testing, and security analysis capabilities for Model Context Protocol (MCP) servers.

## Multi-Server Aggregation

Connect to multiple MCP servers simultaneously and access them through a unified interface.

**Capabilities:**
- Support for both HTTP and stdio-based MCP servers
- Unified API for tools, prompts, and resources from all servers
- Service selection — choose which servers to activate
- Server prefixing for tool calls (e.g., `server:tool_name`)
- Per-server failure isolation — a single broken upstream does not take down the proxy

> mcp-shark is a *transparent aggregator*, not a load balancer. Each request is
> dispatched to the upstream that owns the requested tool/prompt/resource. There
> is no automatic load balancing or replica failover.

## Real-Time Monitoring & Analysis

Wireshark-like interface for inspecting all MCP communications with detailed packet inspection.

**View Modes:**
- **General List View**: Flat chronological view of all traffic
- **Grouped by Session & Server**: Organize by conversation sessions
- **Grouped by Server & Session**: Organize by server activity
- **Protocol View**: View traffic by protocol type

**Advanced Features:**
- **Live Traffic Capture**: WebSocket-powered real-time updates
- **Advanced Filtering**: Filter by method, status, protocol, session, server, direction, and more
- **Full-Text Search**: Search across all fields including URLs, endpoints, and JSON-RPC methods
- **Detailed Packet Inspection**: Click any packet to see full headers, request/response body, timing information, and JSON-RPC details
- **Multiple Payload Views**: Raw, JSON, and Hex views for data inspection

## MCP Playground

Interactive testing environment for exploring and testing MCP servers.

**Tool Testing:**
- Browse all available tools from all servers in one place
- See tool descriptions, parameters, and schemas
- Call tools with custom JSON arguments
- View results in real-time with formatted output
- Test edge cases and different parameter combinations

**Prompt Exploration:**
- List all prompts from all connected servers
- View prompt descriptions and argument schemas
- Test prompts with different arguments
- See formatted prompt results

**Resource Browsing:**
- Discover all available resources across all servers
- Read resource contents directly in the UI
- Explore resource URIs and metadata

**Session Management:**
- Automatic session tracking
- Maintains context across multiple tool calls
- Test stateful workflows and conversations

## Local Analysis

Rule-based static analysis for MCP servers running through the proxy.

**Key Features:**
- **Analyse Running Servers**: Scans only MCP servers currently connected via the proxy
- **YARA-Based Detection**: Uses YARA rules for pattern matching and vulnerability detection
- **Scan History**: View and compare past analysis results
- **Multiple View Modes**: Dashboard, By Severity, By Category, By Target

**Security Categories:**
- **MCP Top 10**: Based on OWASP MCP security guidelines
- **Agentic Top 10**: Agentic security risk categories
- **Custom Rules**: Define your own YARA detection rules

**UI Controls:**
- **Analyse**: Run static analysis (disabled until servers are running)
- **History**: Toggle scan history view
- **Clear**: Remove all findings and history

> **See Also**: [Local Analysis Guide](local-analysis.md) for detailed documentation including YARA rule creation and API reference.

## Smart Scan

AI-powered security analysis for MCP servers.

**Capabilities:**
- **Automated Scanning**: Discover and scan multiple MCP servers automatically
- **Security Risk Assessment**: Get overall risk levels (LOW, MEDIUM, HIGH) for each server
- **Detailed Findings**: Comprehensive security analysis including:
  - Tool security analysis
  - Prompt injection risks
  - Resource access patterns
  - Overall security recommendations
- **Cached Results**: Results are cached for quick access without re-scanning
- **Full Report Access**: View complete analysis reports with detailed findings at [https://smart.mcpshark.sh](https://smart.mcpshark.sh)

**Batch Scanning:**
- Server discovery from configuration
- Selective scanning of specific servers
- Parallel batch processing
- Real-time progress tracking

**Local vs Smart Scan:**
| Feature | Local Analysis | Smart Scan |
|---------|---------------|------------|
| Analysis Type | Static (rule-based) | Dynamic (AI-powered) |
| Detection | Pattern packs (YARA-syntax + regex fallback) + JS plugins | Semantic analysis |
| Requires | Running proxy servers | Server configuration |
| Speed | Fast | Varies by server count |
| Use Case | Quick pattern checks | Deep security analysis |

## AAuth Visibility

Observability for [AAuth](https://www.aauth.dev) / RFC 9421 HTTP Message
Signatures across captured MCP traffic.

**Capabilities:**

- **AAuth posture chip** on every captured frame — `signed`, `aauth-aware`,
  `bearer`, `bearer-coexist`, or `none`.
- **AAuth Explorer tab** — force-directed graph of every Agent / Mission /
  Resource / Signing algorithm / Access mode observed across captured traffic.
  Each node is grounded in real packet evidence.
- **Filterable traffic** — filter requests by posture, agent, or mission via
  query params (`aauthPosture`, `aauthAgent`, `aauthMission`).
- **`aauth-visibility` rule pack** — informational findings for AAuth
  identity, JWKS / `.well-known/aauth` discovery, mission context,
  AAuth-Requirement challenges, and the `bearer + AAuth coexistence`
  anti-pattern.
- **Synthetic preview data** — `POST /api/aauth/self-test` and the legacy
  `aauth-traffic-generator.js` script populate the views with realistic AAuth
  packet shapes for demos and CI.

**Deliberately out of scope:** mcp-shark never verifies signatures, fetches JWKS,
handles private keys, or rewrites/blocks traffic based on AAuth posture.

> **See Also**: [AAuth Visibility](aauth-visibility.md).

## IDE Integration

Seamless integration with popular IDEs and editors.

**Supported IDEs (UI auto-detect & patch):**
- **Cursor**: Detects `~/.cursor/mcp.json`
- **Windsurf**: Detects `~/.codeium/windsurf/mcp_config.json`
- **Codex**: Detects `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`)
- **Custom Configurations**: Upload and use any MCP configuration file

**Supported IDEs (CLI scan only):**

The CLI (`scan`, `list`, `doctor`) recognises a much wider list of IDE
configuration paths for **read-only** scanning, including Claude Desktop,
VS Code, Trae, Zed, Roo, Cline, Continue, and other MCP-aware tools. See the
[Supported IDE configurations](../README.md#supported-ide-configurations)
table in the README for the full list.

**Automatic Configuration:**
- Detects your IDE's MCP configuration files
- Converts IDE-specific config formats to MCP Shark format
- Creates backups before making any changes
- Updates your IDE config to point to MCP Shark server
- Restores original configuration when you stop the server

**Zero-Configuration Setup:**
1. Start MCP Shark UI
2. Select your IDE from the detected list (or upload your config)
3. Choose which servers to enable (optional)
4. Click "Start MCP Shark"
5. Your IDE is now using MCP Shark automatically

## Analytics & Statistics

Comprehensive traffic analysis and performance metrics.

**Traffic Statistics:**
- Request counts and unique sessions
- Server activity tracking
- Protocol distribution
- Error rate monitoring

**Performance Metrics:**
- Duration and latency measurements
- Payload size tracking
- Timing breakdown for each request
- Status code distribution

**Session Analytics:**
- Track conversations and stateful interactions
- Session duration and activity
- Request/response correlation

## Data Management

Export and backup capabilities for data preservation and analysis.

**Export Capabilities:**
- **Traffic Export**: Export captured traffic in JSON, CSV, or TXT formats
- **Log Export**: Export server logs as text files
- **Filtered Exports**: Export only filtered results

**Backup Management:**
- Automatic backups of configuration files before changes
- View all backups with timestamps and file sizes
- Restore any backup to original location
- Delete backups when no longer needed
- View backup contents for inspection

**Database Access:**
- SQLite database for efficient storage
- Direct database access for advanced analysis
- Database location: `~/.mcp-shark/db/mcp-shark.sqlite`

## Modern UI/UX

Developer-friendly interface with modern design patterns.

**Design Features:**
- Dark theme optimized for developers
- Expandable action menu for quick access to API docs and shutdown
- Responsive design for different screen sizes
  - Adaptive navigation with dropdown menu for smaller windows (< 1200px)
  - Compact views for mobile and tablet devices
- Smooth animated transitions
- Hex viewer for binary data inspection
- Multiple payload viewing modes (Raw, JSON, Hex)
- Spinner-based loading indicators for better visual feedback

**Accessibility:**
- Keyboard navigation support
- Semantic HTML elements
- ARIA labels and roles
- Screen reader compatibility

## Configuration Management

Comprehensive configuration management with safety features.

**Auto-Detection:**
- Automatically detects IDE configuration files
- Supports multiple IDE formats

**Config Conversion:**
- Converts IDE config format to MCP Shark format
- Preserves original configuration structure

**Backup & Restore:**
- Automatic backups before making changes
- Timestamped backup files
- One-click restore functionality

**Config Viewer:**
- View and inspect configuration files
- View backup contents
- Compare configurations

**Service Filtering:**
- Selectively enable/disable specific servers
- Per-server configuration options

