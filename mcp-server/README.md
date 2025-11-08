# MCP Shark Server

> **Aggregate multiple Model Context Protocol (MCP) servers into a single unified interface**

MCP Shark Server is a powerful aggregation layer that combines multiple MCP servers (both HTTP and stdio-based) into one cohesive endpoint. It provides a unified API for tools, prompts, and resources from all connected servers, with comprehensive audit logging and session management.

## ✨ Features

- **🔗 Multi-Server Aggregation**: Connect to multiple MCP servers simultaneously (HTTP and stdio)
- **📊 Comprehensive Audit Logging**: SQLite-based logging with request/response tracking, performance metrics, and error handling
- **🌐 HTTP Interface**: RESTful API endpoint for easy integration with any MCP client
- **🔄 Session Management**: Automatic session handling for stateful MCP interactions
- **🛠️ Unified Tool Access**: Access tools from all connected servers through a single interface
- **📝 Prompt & Resource Aggregation**: Unified access to prompts and resources across all servers
- **⚡ Streaming Support**: Full support for async iterable responses (streaming)
- **🔍 Request Correlation**: Track request/response pairs with correlation IDs

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Configuration

Create a configuration file at `temp/mcps.json`:

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

**Recommended: Managed through UI**

The recommended way to run the MCP server is through the UI interface:

1. Start the UI server (see main README)
2. Use the UI's "MCP Server Setup" tab to configure and start the server

**Alternative: Run Directly**

If you need to run the server independently:

```bash
npm start
```

The server will start on `http://localhost:9851/mcp`

**Note:** When running directly, ensure you have a valid configuration file at `temp/mcps.json` before starting.

## 📖 Usage

### Endpoint

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

### Example: Call a Tool

Tools from different servers are prefixed with the server name:

```bash
curl -X POST http://localhost:9851/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "github:search_repositories",
      "arguments": {
        "query": "language:javascript stars:>1000"
      }
    }
  }'
```

## 🏗️ Architecture

```
┌─────────────────┐
│   MCP Client    │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────────┐
│   MCP Shark Server               │
│   (Express on port 9851)         │
│                                   │
│  ┌────────────────────────────┐ │
│  │  Internal MCP Server        │ │
│  │  - tools/list               │ │
│  │  - tools/call               │ │
│  │  - prompts/list             │ │
│  │  - prompts/get              │ │
│  │  - resources/list           │ │
│  │  - resources/read           │ │
│  └──────────┬──────────────────┘ │
│             │                     │
│  ┌──────────▼──────────────────┐ │
│  │  Audit Logger (SQLite)      │ │
│  └──────────────────────────────┘ │
└──────────┬────────────────────────┘
           │
           ├──► HTTP MCP Server
           ├──► stdio MCP Server
           └──► stdio MCP Server
```

## 📁 Project Structure

```
mcp-server/
├── mcp-shark.js            # Main entry point
├── lib/
│   ├── server/
│   │   ├── internal/           # Internal MCP server (aggregator)
│   │   │   ├── server.js       # Server creation
│   │   │   ├── run.js          # Express server setup
│   │   │   ├── session.js      # Session management
│   │   │   └── handlers/       # Request handlers
│   │   └── external/           # External MCP server clients
│   │       ├── all.js          # Multi-server orchestration
│   │       ├── config.js       # Configuration parsing
│   │       ├── kv.js           # Key-value store for servers
│   │       └── single/         # Single server client
│   ├── db/
│   │   ├── init.js             # Database initialization
│   │   ├── logger.js           # Audit logging
│   │   └── query.js            # Database queries
│   └── common/
│       └── error.js            # Error handling utilities
└── temp/
    ├── db/                     # SQLite database
    └── mcps.json               # Server configuration
```

## 🔧 Configuration Format

### HTTP Server

```json
{
  "servers": {
    "server-name": {
      "type": "http",
      "url": "https://api.example.com/mcp/",
      "headers": {
        "Authorization": "Bearer TOKEN"
      }
    }
  }
}
```

### stdio Server

```json
{
  "servers": {
    "server-name": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

## 📊 Audit Logging

All MCP communications are logged to SQLite (`temp/db/mcp-shark.sqlite`) with:

- **Request/Response Tracking**: Full payload logging with correlation IDs
- **Performance Metrics**: Duration, latency, and timing information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Session Management**: Session ID tracking for stateful interactions
- **Server Identification**: Track which external server handled each request

### Database Schema

- `mcp_communications`: All request/response communications
- `mcp_request_response_pairs`: Correlated request/response pairs

## 🛠️ Development

### Scripts

```bash
# Start the server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Code Quality

- **ESLint**: Code linting with Prettier integration
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation

## 🔌 Supported MCP Methods

- `tools/list` - List all tools from all servers
- `tools/call` - Call a tool from any server
- `prompts/list` - List all prompts from all servers
- `prompts/get` - Get a specific prompt
- `resources/list` - List all resources from all servers
- `resources/read` - Read a specific resource

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please ensure your code passes linting and formatting checks before submitting.

---

**Built with ❤️ using the Model Context Protocol SDK**
