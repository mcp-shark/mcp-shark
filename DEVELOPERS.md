# Developer Guide

This guide is for developers who want to contribute to or extend MCP Shark.

## Getting Started

1. **Clone the repository:**

```bash
git clone <repository-url>
cd mcp-shark
```

2. **Install dependencies:**

```bash
npm run install:all
```

3. **Set up git hooks:**

```bash
npm run prepare
```

This sets up Husky for pre-commit and commit-msg validation.

## Development Scripts

**Using npm:**

```bash
# Install all dependencies
npm run install:all

# Start UI (recommended - manage MCP server through UI)
npm run start:ui

# Start MCP server directly (alternative - if not using UI)
npm run start:server

# UI development mode (with hot reload)
npm run dev:ui

# Build UI for production
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

## Architecture Overview

- **`mcp-server/`**: MCP aggregation server implementation
  - `mcp-shark.js`: Main entry point
  - `lib/`: Core server logic, transport handlers, audit logging
  - Uses SQLite for audit logging

- **`ui/`**: React-based web interface
  - `src/`: React components and UI logic
  - `server.js`: Express server for API and WebSocket
  - `dist/`: Built frontend (generated)

- **`mcp-shark-common/`**: Shared utilities (if present)
  - Common functions used by both server and UI

## Code Quality

This project uses:

- **ESLint**: Code linting with Prettier integration
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Test your changes thoroughly
4. Run linting and formatting checks
5. Commit using Conventional Commits format
6. Push and create a Pull Request

## Testing

Before submitting changes, ensure:

- Code passes linting checks
- Code is properly formatted
- Changes work across different platforms (macOS, Linux, Windows)
- Documentation is updated if needed

## Building

To build the UI for production:

```bash
npm run build:ui
# or
make build-ui
```

The built files will be in `ui/dist/`.

## Debugging

- Check server logs in the UI's "MCP Shark Logs" tab
- Database is located at `~/.mcp-shark/db/mcp-shark.sqlite`
- UI server runs on port 9853
- MCP server runs on port 9851

## Additional Resources

- See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- See [README.md](./README.md) for user documentation
