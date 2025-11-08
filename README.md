# MCP Shark

> **Aggregate multiple Model Context Protocol (MCP) servers into a single unified interface with a powerful monitoring UI**

MCP Shark is a complete solution for aggregating multiple MCP servers (both HTTP and stdio-based) into one cohesive endpoint, with a real-time web interface for monitoring and inspecting all communications.

## 🎯 Overview

MCP Shark consists of two main components:

1. **MCP Server** (`mcp-server/`) - Aggregates multiple MCP servers into a single endpoint
2. **UI** (`ui/`) - Real-time web interface for monitoring and managing MCP communications

Both components work together but can also be run independently.

## ✨ Features

### MCP Server
- **🔗 Multi-Server Aggregation**: Connect to multiple MCP servers simultaneously (HTTP and stdio)
- **📊 Comprehensive Audit Logging**: SQLite-based logging with request/response tracking
- **🌐 HTTP Interface**: RESTful API endpoint for easy integration
- **🔄 Session Management**: Automatic session handling for stateful MCP interactions
- **🛠️ Unified Tool Access**: Access tools from all connected servers through a single interface

### UI
- **Real-time Updates**: WebSocket-powered live log streaming
- **Advanced Filtering**: Filter by server, direction, HTTP method, and status
- **Detailed Log View**: Inspect individual log entries with full payload details
- **MCP Server Management**: Configure and manage MCP Shark server from the UI
- **Dark Theme UI**: Modern, developer-friendly interface

## 🚀 Quick Start

### Quick Reference

```bash
# Install dependencies
npm run install:all

# Start UI (recommended)
make start

# Stop UI
make stop

# View all commands
make help
```

Then open `http://localhost:9853` in your browser to configure and start the MCP server through the UI.

### Installation

Install all dependencies:

```bash
npm run install:all
```

After installation, initialize git hooks:

```bash
npm run prepare
```

This sets up Husky for pre-commit and commit-msg validation.

Or install individually:

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd mcp-server && npm install

# Install UI dependencies
cd ../ui && npm install
```

### Configuration

Create a configuration file at `mcp-server/temp/mcps.json`:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    },
    "@21st-dev/magic": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    }
  }
}
```

### Running

#### Recommended: Start UI and Manage MCP Server Through UI

The recommended way to run MCP Shark is to start the UI, then use the UI's setup interface to configure and start the MCP server:

**Using Makefile (recommended):**
```bash
# Start UI (port 9853) - default command
make start
# or explicitly
make start-ui

# Stop UI - default command
make stop
# or explicitly
make stop-ui
```

**Using npm:**
```bash
# Start UI (port 9853)
npm run start:ui

# Stop UI (Ctrl+C or use make stop)
```

Then:
1. Open `http://localhost:9853` in your browser
2. Go to the "MCP Server Setup" tab
3. Select or provide your MCP configuration file
4. Click "Start MCP Shark" to start the server

The UI will automatically:
- Convert your MCP config to the correct format
- Start the MCP server on port 9851
- Manage the server lifecycle (start/stop/restart)

**Note:** When you stop the UI using `make stop`, it will automatically stop the MCP server as well (if it was started through the UI).

#### Alternative: Run MCP Server Separately

If you need to run the MCP server independently (without the UI):

```bash
# Start MCP server directly (port 9851)
cd mcp-server
npm start

# Or using Makefile
make start-server

# Stop MCP server
make stop-server
```

**Note:** When running the server separately, you'll need to manually create the config file at `mcp-server/temp/mcps.json` before starting.

#### Development Mode

**UI Development Mode (with hot reload):**
```bash
cd ui
npm run dev

# Or using Makefile
make dev-ui
```

The UI will be available at `http://localhost:5173` (or the port Vite assigns).

## 📖 Usage

### MCP Server Endpoint

All MCP requests should be sent to:

```
POST http://localhost:9851/mcp
```

### Example: List All Tools

```bash
curl -X POST http://localhost:9851/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### UI Access

Open your browser to:

```
http://localhost:9853
```

## 🏗️ Architecture

```
┌─────────────────┐
│   MCP Client    │
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
│   MCP Shark Server (9851)        │
│   - Aggregates MCP servers       │
│   - Audit logging (SQLite)       │
└─────────────────────────────────┘
```

**Note:** The MCP Shark Server is started and managed by the UI as a child process. The UI provides the interface to configure, start, stop, and monitor the server.

## 📁 Project Structure

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

## 🛠️ Development

### Scripts

From the root directory:

```bash
# Install all dependencies
npm run install:all

# Start UI (recommended - manage MCP server through UI)
npm run start:ui

# Start MCP server directly (alternative - if not using UI)
npm run start:server

# UI development mode
npm run dev:ui

# Build UI
npm run build:ui

# Lint MCP server
npm run lint:server

# Format MCP server
npm run format:server
```

**Using Makefile:**

```bash
# Start UI (recommended - default)
make start              # or make start-ui

# Stop UI (default)
make stop               # or make stop-ui
# Note: This will stop the UI and any MCP server started through it

# Start MCP server directly (alternative - not recommended)
make start-server
make stop-server

# Development mode
make dev-ui

# Build UI for production
make build-ui

# Clean up (stops services and removes PID files)
make clean

# Show all available commands
make help
```

**Makefile Commands Summary:**

| Command | Description |
|---------|-------------|
| `make start` / `make start-ui` | Start the UI server on port 9853 |
| `make stop` / `make stop-ui` | Stop the UI server and any related processes |
| `make start-server` | Start MCP server directly (requires manual config) |
| `make stop-server` | Stop MCP server if running separately |
| `make dev-ui` | Start UI in development mode with hot reload |
| `make build-ui` | Build UI for production |
| `make clean` | Stop all services and clean up PID/log files |
| `make help` | Show all available commands |

### Code Quality

- **ESLint**: Code linting with Prettier integration
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. The format is:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

#### Examples

```bash
feat(ui): add dark mode toggle
fix(server): resolve memory leak in session handling
docs(readme): update installation instructions
refactor(mcp-server): simplify error handling
chore: update dependencies
```

#### Pre-commit Hooks

Before each commit, the following checks run automatically:

1. **Lint-staged**: Runs ESLint and Prettier on staged files
2. **Commitlint**: Validates commit message format

If any check fails, the commit will be rejected. Fix the issues and try again.

## 🔌 Supported MCP Methods

- `tools/list` - List all tools from all servers
- `tools/call` - Call a tool from any server
- `prompts/list` - List all prompts from all servers
- `prompts/get` - Get a specific prompt
- `resources/list` - List all resources from all servers
- `resources/read` - Read a specific resource

## 📊 Audit Logging

All MCP communications are logged to SQLite (`mcp-server/temp/db/mcp-shark.sqlite`) with:

- **Request/Response Tracking**: Full payload logging with correlation IDs
- **Performance Metrics**: Duration, latency, and timing information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Session Management**: Session ID tracking for stateful interactions
- **Server Identification**: Track which external server handled each request

## 🚀 Future: Electron App

This project is structured to support future Electron app integration. The separate `mcp-server` and `ui` components can be packaged together in an Electron application.

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please ensure your code passes linting and formatting checks before submitting.

---

**Built with ❤️ using the Model Context Protocol SDK**

