# Getting Started

This guide will help you install and set up MCP Shark for the first time.

## Installation

**Run instantly with npx (recommended - no installation required):**

```bash
npx @mcp-shark/mcp-shark --open
```

**Or install globally:**

```bash
npm install -g @mcp-shark/mcp-shark
mcp-shark --open
```

**Local installation:**

```bash
npm install @mcp-shark/mcp-shark
npx mcp-shark --open
```

## First Run

### Starting MCP Shark

After installation, start MCP Shark:

```bash
mcp-shark
```

**Open browser automatically:**

```bash
mcp-shark --open
# or
mcp-shark -o
```

The first run will:
1. Install dependencies if needed
2. Build the frontend if needed
3. Start the server on `http://localhost:9853`
4. Optionally open your browser automatically (with `--open` flag)

### Accessing the UI

Once started, access the web interface at:

```
http://localhost:9853
```

If you used the `--open` flag, your browser will open automatically.

## Initial Setup

### 1. Interactive Tour

On first launch, you'll see an interactive tour. Follow it to learn the basics of MCP Shark.

### 2. Configure Servers

Navigate to the **"MCP Server Setup"** tab to configure your MCP servers.

**Automatic Detection:**

MCP Shark automatically detects configuration files from:
- **Cursor**: `~/.cursor/mcp.json`
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`
- **Codex**: `~/.codex/config.toml` (or `$CODEX_HOME/config.toml`)

**Manual Configuration:**

You can also upload your own MCP configuration file.

### 3. Select Servers

Choose which servers to enable. You can:
- Enable all servers
- Select specific servers
- Disable servers you don't need

### 4. Start Monitoring

Click **"Start MCP Shark"** to begin capturing traffic. The server will:
- Create backups of your configuration files
- Update your IDE configuration to point to MCP Shark
- Start aggregating traffic from all enabled servers

## Next Steps

- **Explore Traffic**: Go to the "Traffic Capture" tab to see real-time MCP communications
- **Test Tools**: Use the "MCP Playground" tab to interactively test tools, prompts, and resources
- **Security Analysis**: Run "Smart Scan" to analyze your MCP servers for security risks
- **View Logs**: Check the "MCP Shark Logs" tab for server output and debugging information

For detailed usage instructions, see the [User Guide](user-guide.md).

## Stopping MCP Shark

To stop MCP Shark:

1. Press `Ctrl+C` in the terminal where MCP Shark is running
2. Or click **"Stop MCP Shark"** in the "MCP Server Setup" tab

When stopped, MCP Shark will restore your original IDE configuration files from backups.

## Troubleshooting

If you encounter issues:

- Check the [Troubleshooting Guide](troubleshooting.md)
- Review logs in the "MCP Shark Logs" tab
- Verify your configuration files are valid JSON
- Ensure Node.js 20+ is installed

## System Requirements

- **Node.js**: 20.0.0 or higher
- **npm**: Comes with Node.js
- **Operating System**: macOS, Windows, or Linux

## Package Information

- **Package Name**: `@mcp-shark/mcp-shark`
- **npm Registry**: [https://www.npmjs.com/package/@mcp-shark/mcp-shark](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
- **License**: Source-Available Non-Commercial (see [LICENSE](../LICENSE) for details)

> Refer to [`package.json`](../package.json) for the published version — this file no longer hardcodes it.

## Usage Options

**Options:**
- `--open` or `-o`: Automatically open the browser after starting

The executable will:
- Install dependencies if needed
- Build the frontend if needed
- Start the server on `http://localhost:9853`
- Optionally open your browser automatically

