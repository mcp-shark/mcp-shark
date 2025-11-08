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

#### Run Both Server and UI

From the root directory:

```bash
# Start MCP server (port 9851)
npm run start:server

# In another terminal, start UI (port 9853)
npm run start:ui
```

Or use the UI to start the server - the UI includes a setup page where you can configure and start the MCP server.

#### Run Individually

**MCP Server only:**
```bash
cd mcp-server
npm start
```

**UI only:**
```bash
cd ui
npm start
```

**UI Development Mode:**
```bash
cd ui
npm run dev
```

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
│   MCP Shark Server (9851)        │
│   - Aggregates MCP servers       │
│   - Audit logging (SQLite)       │
└──────────┬───────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   MCP Shark UI (9853)            │
│   - Real-time monitoring         │
│   - Server management            │
│   - Log inspection               │
└─────────────────────────────────┘
```

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

# Start MCP server
npm run start:server

# Start UI
npm run start:ui

# UI development mode
npm run dev:ui

# Build UI
npm run build:ui

# Lint MCP server
npm run lint:server

# Format MCP server
npm run format:server
```

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

