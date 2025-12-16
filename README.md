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
- **Version**: 1.4.2
- **License**: Source-Available Non-Commercial (see [LICENSE](LICENSE) for details)
- **Node.js**: Requires Node.js 18+

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
- [Documentation](#documentation)
- [Requirements](#requirements)
- [License](#license)

## About

MCP Shark is a monitoring and aggregation solution for Model Context Protocol (MCP) servers. It provides a unified interface for multiple MCP servers (both HTTP and stdio-based) with real-time traffic inspection, security analysis, and interactive testing capabilities.

Key capabilities:

- **Multi-server aggregation**: Connect to multiple MCP servers simultaneously
- **Real-time monitoring**: Wireshark-like interface for inspecting all MCP communications
- **Interactive playground**: Test tools, prompts, and resources directly in the UI
- **Security analysis**: AI-powered scanning for security risks and vulnerabilities
- **IDE integration**: Automatic configuration for Cursor, Windsurf, and other IDEs

## Features

- **Traffic Capture**: Real-time monitoring with advanced filtering and search
- **MCP Playground**: Interactive testing environment for tools, prompts, and resources
- **Smart Scan**: AI-powered security analysis for MCP servers
- **Session Management**: Track and analyze conversation sessions
- **Export & Backup**: Export data in multiple formats and manage configuration backups
- **Statistics & Analytics**: Performance metrics and traffic analysis

For detailed feature documentation, see [Features Guide](docs/features.md).

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

## Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: Comes with Node.js
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

**Version**: 1.5.0 | **Homepage**: [https://mcpshark.sh](https://mcpshark.sh)
