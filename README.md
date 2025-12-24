<div align="center">

  <img src="https://smart.mcpshark.sh/icon_512x512.png" alt="MCP Shark Logo" width="128" height="128">

  <h1>@mcp-shark/mcp-shark</h1>

  <p>Aggregate multiple Model Context Protocol (MCP) servers into a single unified interface with a powerful monitoring UI</p>

</div>

[![npm version](https://img.shields.io/npm/v/@mcp-shark/mcp-shark.svg)](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
[![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)

## Quick Start

### Desktop Application

Download the native desktop application for macOS, Windows, or Linux:

| Platform    | Download                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| **macOS**   | [Download (ARM64)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/MCP.Shark-1.3.0-arm64-mac.zip)     |
| **Windows** | [Download (Installer)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/MCP.Shark.Setup.1.3.0.exe)     |
| **Linux**   | [Download (ARM64 DEB)](https://github.com/mcp-shark/mcp-shark-app/releases/download/v1.3.0/mcp-shark-app_1.3.0_arm64.deb) |

The desktop application provides a native experience with automatic updates and system integration. No Node.js installation required.

### npm Package

**Install globally:**
```bash
npm install -g @mcp-shark/mcp-shark
```

**Run:**
```bash
mcp-shark --open
```

**Or use npx (no installation):**
```bash
npx @mcp-shark/mcp-shark --open
```

The server will start on `http://localhost:9853` and optionally open your browser automatically.

## What is MCP Shark?

MCP Shark is a monitoring and aggregation solution for Model Context Protocol (MCP) servers. It provides:

- **Multi-server aggregation**: Connect to multiple MCP servers simultaneously
- **Real-time monitoring**: Wireshark-like interface for inspecting all MCP communications
- **Interactive playground**: Test tools, prompts, and resources directly in the UI
- **Security analysis**: AI-powered scanning for security risks and vulnerabilities
- **IDE integration**: Automatic configuration detection for Cursor, Windsurf, Codex, and other IDEs
- **API documentation**: Comprehensive Swagger/OpenAPI documentation for all endpoints with interactive testing
- **Action menu**: Expandable menu providing quick access to API docs, help tour, and server shutdown

## Documentation

### Getting Started
- **[Installation & Setup](docs/getting-started.md)** - Complete installation guide for desktop app and npm package
- **[Quick Start Guide](docs/getting-started.md#quick-start)** - Get up and running in minutes

### User Guides
- **[Features](docs/features.md)** - Detailed feature documentation
- **[User Guide](docs/user-guide.md)** - Complete guide to using MCP Shark
- **[Configuration](docs/configuration.md)** - Configuration options and file formats
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

### Developer Guides
- **[Development Guide](docs/development.md)** - Developer guide and contribution guidelines
- **[Architecture](docs/architecture.md)** - System architecture and design
- **[Database Architecture](docs/database-architecture.md)** - Database architecture and repository pattern
- **[API Reference](docs/api-reference.md)** - API endpoints and WebSocket protocol
- **API Documentation** - Interactive Swagger/OpenAPI documentation available at `/api-docs` when server is running (or click the menu button ☰ in the bottom-right corner, then select the API docs button 📡)

### Architecture & Coding Rules
- **[Architecture Rules](rules/ARCHITECTURE_RULES.md)** - Architecture principles and guidelines
- **[Database Architecture Rules](rules/DB_ARCHITECTURE.md)** - Database architecture rules
- **[Coding Rules](rules/CODING_RULES.md)** - Coding standards and best practices
- **[Linting Rules](rules/LINTING_RULES.md)** - Linting configuration and rules

## Requirements

- **Node.js**: 20.0.0 or higher (for npm package)
- **Operating System**: macOS, Windows, or Linux

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

**Version**: 1.5.9 | **Homepage**: [https://mcpshark.sh](https://mcpshark.sh)
