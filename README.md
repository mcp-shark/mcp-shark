<div align="center">

  <img src="https://smart.mcpshark.sh/icon_512x512.png" alt="MCP Shark Logo" width="128" height="128">

  <h1>@mcp-shark/mcp-shark</h1>

  <p>Aggregate multiple Model Context Protocol (MCP) servers into a single unified interface with a powerful monitoring UI</p>

</div>

[![npm version](https://img.shields.io/npm/v/@mcp-shark/mcp-shark.svg)](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)

## Desktop Application

Download the native desktop application for macOS, Windows, or Linux:

| Platform    | Download                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| **macOS**   | [Download (ARM64)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/MCP.Shark-1.3.0-arm64-mac.zip)     |
| **Windows** | [Download (Installer)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/MCP.Shark.Setup.1.3.0.exe)     |
| **Linux**   | [Download (ARM64 DEB)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/mcp-shark-app_1.3.0_arm64.deb) |

The desktop application provides a native experience with automatic updates and system integration. No Node.js installation required.

## npm Package

### Installation

**Global installation (recommended):**

```bash
npm install -g @mcp-shark/mcp-shark
```

**Local installation:**

```bash
npm install @mcp-shark/mcp-shark
```

**Using npx (no installation required):**

```bash
npx @mcp-shark/mcp-shark --open
# or
npx @mcp-shark/mcp-shark -o
# or
npx @mcp-shark/mcp-shark
```

### Usage

After global installation, run:

```bash
mcp-shark
```

**Options:**
- `--open` or `-o`: Automatically open the browser after starting

The executable will:
- Install dependencies if needed
- Build the frontend if needed
- Start the server on `http://localhost:9853`
- Optionally open your browser automatically

**Package Information:**
- **Package Name**: `@mcp-shark/mcp-shark`
- **npm Registry**: [https://www.npmjs.com/package/@mcp-shark/mcp-shark](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
- **Version**: 1.5.4
- **License**: Source-Available Non-Commercial (see [LICENSE](LICENSE) for details)
- **Node.js**: Requires Node.js 20.0.0 or higher

## Quick Start

1. **Install:**
   ```bash
   npm install -g @mcp-shark/mcp-shark
   ```

2. **Run:**
   ```bash
   mcp-shark --open
   ```

3. **Access the UI:**
   Navigate to `http://localhost:9853` (or it will open automatically with `--open`)

4. **Configure servers:**
   Go to the "MCP Server Setup" tab and select your IDE configuration or upload a custom config file.

5. **Start monitoring:**
   Click "Start MCP Shark" to begin capturing traffic.

For detailed instructions, see [Getting Started Guide](docs/getting-started.md).

## Table of Contents

- [Desktop Application](#desktop-application)
- [npm Package](#npm-package)
- [Quick Start](#quick-start)
- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Configuration Support](#configuration-support)
- [Documentation](#documentation)
- [Requirements](#requirements)
- [Development](#development)
- [License](#license)

## About

MCP Shark is a monitoring and aggregation solution for Model Context Protocol (MCP) servers. It provides a unified interface for multiple MCP servers (both HTTP and stdio-based) with real-time traffic inspection, security analysis, and interactive testing capabilities.

**Key capabilities:**

- **Multi-server aggregation**: Connect to multiple MCP servers simultaneously
- **Real-time monitoring**: Wireshark-like interface for inspecting all MCP communications
- **Interactive playground**: Test tools, prompts, and resources directly in the UI
- **Security analysis**: AI-powered scanning for security risks and vulnerabilities
- **IDE integration**: Automatic configuration detection for Cursor, Windsurf, Codex, and other IDEs
- **Configuration management**: Support for JSON and TOML configuration formats

## Features

### Traffic Capture & Monitoring
- **Real-time monitoring**: WebSocket-powered live traffic capture with automatic updates
- **Advanced filtering**: Filter by method, status, protocol, session, server, direction, and more
- **Full-text search**: Search across all fields including URLs, endpoints, and JSON-RPC methods
- **Multiple view modes**: General list, grouped by session/server, grouped by server/session, and protocol view
- **Detailed packet inspection**: Click any packet to see full headers, request/response body, timing information, and JSON-RPC details
- **Multiple payload views**: Raw, JSON, and Hex views for data inspection
- **Export capabilities**: Export data in JSON, CSV, or TXT formats

### MCP Playground
- **Interactive testing**: Test tools, prompts, and resources directly in the UI
- **Tool testing**: Browse all available tools, see descriptions and schemas, call tools with custom JSON arguments
- **Prompt exploration**: List all prompts, view descriptions and argument schemas, test with different arguments
- **Resource browsing**: List and read resources from all connected servers

### Smart Scan
- **AI-powered security analysis**: Automated scanning for security risks and vulnerabilities
- **Cached results**: Local caching of scan results for faster access
- **Batch scanning**: Scan multiple servers simultaneously
- **Risk assessment**: Detailed risk level analysis for each server

### Configuration Management
- **Automatic detection**: Automatically detects configuration files from Cursor, Windsurf, and Codex
- **Multiple format support**: Supports both JSON and TOML configuration formats
- **Codex integration**: Full support for Codex `config.toml` format with automatic conversion
- **Backup & restore**: Automatic backup creation before configuration changes
- **Service selection**: Choose which servers to activate from your configuration

### Session & Conversation Management
- **Session tracking**: Track and analyze conversation sessions
- **Conversation grouping**: Group requests and responses by conversation
- **Statistics & analytics**: Performance metrics and traffic analysis

## Architecture

MCP Shark follows a clean architecture pattern with strict separation of concerns:

```
┌─────────────┐
│ Controllers │  (HTTP handling: extraction, sanitization, serialization)
└──────┬──────┘
       │ uses models
       ▼
┌─────────────┐
│   Models    │  (Typed data structures)
└──────┬──────┘
       │ used by
       ▼
┌─────────────┐
│  Services   │  (Business Logic - HTTP-agnostic)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│Repositories │  (Data Access)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│  Database   │  (SQLite)
└─────────────┘
```

### Architecture Principles

- **Service-Oriented Architecture (SOA)**: All business logic is in service classes
- **HTTP-Agnostic Services**: Services accept and return typed models, with no knowledge of HTTP
- **Dependency Injection**: All dependencies are managed through `DependencyContainer`
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Code**: No nested functions, all imports at top, file size limits (250 lines max for backend files)

### Core Components

- **Controllers** (`ui/server/controllers/`): Handle HTTP concerns (request parsing, response formatting, error handling)
- **Services** (`core/services/`): Contain all business logic, HTTP-agnostic
- **Repositories** (`core/repositories/`): Encapsulate database access
- **Models** (`core/models/`): Typed data structures for data transfer
- **Libraries** (`core/libraries/`): Pure utility functions with no dependencies
- **Constants** (`core/constants/`): Well-defined constants (no magic numbers)
- **MCP Server** (`core/mcp-server/`): Core MCP server implementation with audit logging

For detailed architecture documentation, see [Architecture Guide](docs/architecture.md) and [Core README](core/README.md).

## Configuration Support

MCP Shark supports multiple configuration formats and automatically detects configurations from various IDEs:

### Supported Formats

- **JSON**: Standard MCP configuration format (used by Cursor, Windsurf)
- **TOML**: Codex configuration format (`config.toml`)

### Automatic Detection

MCP Shark automatically detects configuration files from:

- **Cursor**: `~/.cursor/mcp.json`
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`
- **Codex**: `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`)

### Codex Integration

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

### Configuration Features

- **Automatic backup**: Configurations are automatically backed up before changes
- **Service selection**: Choose which servers to activate from your configuration
- **Format conversion**: Automatic conversion between formats when needed
- **Validation**: Comprehensive validation of configuration files

## Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Getting Started](docs/getting-started.md)** - Installation, setup, and first steps
- **[Features](docs/features.md)** - Detailed feature documentation
- **[User Guide](docs/user-guide.md)** - Complete guide to using MCP Shark
- **[Architecture](docs/architecture.md)** - System architecture and design
- **[API Reference](docs/api-reference.md)** - API endpoints and WebSocket protocol
- **[Configuration](docs/configuration.md)** - Configuration options and file formats
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- **[Development](docs/development.md)** - Developer guide and contribution guidelines

### Architecture Documentation

- **[Core Architecture](core/README.md)** - Detailed core architecture documentation
- **[Architecture Rules](rules/ARCHITECTURE_RULES.md)** - Architecture principles and guidelines
- **[Coding Rules](rules/CODING_RULES.md)** - Coding standards and best practices
- **[UI Endpoint Compliance](rules/UI_ENDPOINT_COMPLIANCE_CHECKLIST.md)** - UI endpoint compliance checklist

## Requirements

- **Node.js**: 20.0.0 or higher
- **npm**: Comes with Node.js
- **Operating System**: macOS, Windows, or Linux

## Development

### Code Quality

MCP Shark maintains strict code quality standards:

- **Linting**: Biome for code linting and formatting
- **Architecture Compliance**: Regular compliance checks ensure adherence to architecture principles
- **File Size Limits**: Backend files must not exceed 250 lines
- **No Nested Functions**: All functions must be at module or class level
- **Imports at Top**: All imports must be at the top of files
- **No Magic Numbers**: All constants must be well-defined

### Running Locally

```bash
# Install dependencies
npm install

# Build UI
npm run build:ui

# Start development server
npm run dev

# Run linter
npm run lint

# Format code
npm run format
```

### Project Structure

```
mcp-shark/
├── bin/                    # Executable scripts
├── core/                   # Core architecture
│   ├── constants/         # Well-defined constants
│   ├── container/         # Dependency injection
│   ├── libraries/         # Pure utility libraries
│   ├── models/           # Typed data models
│   ├── mcp-server/       # MCP server implementation
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic layer
├── lib/                   # Common utilities
├── ui/                    # Web UI
│   ├── server/           # Express server and routes
│   └── src/              # React frontend
├── docs/                  # Documentation
├── rules/                 # Architecture and coding rules
└── scripts/               # Build and utility scripts
```

For detailed development information, see [Development Guide](docs/development.md) and [DEVELOPERS.md](DEVELOPERS.md).

## License

Source-Available Non-Commercial License

This is not an OSI-approved open source license. The source code is available, but commercial use is prohibited without a separate commercial agreement.

**Summary:**
- ✅ **Allowed**: View, fork, modify, and run for personal, educational, or internal company use
- ❌ **Not Allowed**: Sell, resell, or integrate into paid products/services without written permission

See the [LICENSE](LICENSE) file for full terms and conditions.

## Related Projects

- **[mcp-shark-app](https://github.com/mcp-shark/mcp-shark-app)**: Electron desktop application wrapper
- **[mcp-shark-site](https://github.com/mcp-shark/mcp-shark-site)**: Official website and documentation
- **[smart-scan-web-app](https://github.com/mcp-shark/smart-scan-web-app)**: Smart Scan web interface

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/mcp-shark/mcp-shark/issues)
- **Website**: [https://mcpshark.sh](https://mcpshark.sh)

---

**Version**: 1.5.4 | **Homepage**: [https://mcpshark.sh](https://mcpshark.sh)
