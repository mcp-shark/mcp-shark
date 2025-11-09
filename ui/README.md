# MCP Shark UI

A real-time web interface for monitoring and inspecting MCP (Model Context Protocol) communications. Built with React and Express, this tool provides a sleek, dark-themed dashboard for viewing server logs, filtering communications, and analyzing request/response patterns.

## ✨ Features

- **Real-time Updates**: WebSocket-powered live log streaming
- **Advanced Filtering**: Filter by server, direction (request/response), HTTP method, and status
- **Detailed Log View**: Inspect individual log entries with full payload details
- **Performance Metrics**: View duration, payload size, and status for each communication
- **Dark Theme UI**: Modern, developer-friendly interface
- **SQLite Backend**: Efficient storage and querying of communication logs
- **MCP Server Management**: Configure and manage MCP Shark server from the UI

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Express.js, WebSocket (ws)
- **Database**: SQLite (better-sqlite3)
- **Build Tool**: Vite

## 📦 Installation

From the root directory:

```bash
# Install all dependencies (recommended)
npm run install:all

# Or install UI dependencies only
cd ui
npm install
```

## 🚀 Usage

### Starting the UI

**Production Mode:**

1. Build the frontend:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

Or specify a custom database path:

```bash
DB_PATH=/path/to/mcp-shark.sqlite npm start
```

The server will start on port `9853` by default (configurable via `UI_PORT` environment variable).

**Development Mode:**

Start the development server with hot reload:

```bash
npm run dev
```

The UI will be available at `http://localhost:5173` (or the port Vite assigns).

### Managing the MCP Server

The MCP server is **managed through the UI**, not started separately:

1. Start the UI server (see above)
2. Open `http://localhost:9853` in your browser
3. Navigate to the **"MCP Server Setup"** tab
4. Select or provide your MCP configuration file (e.g., `~/.cursor/mcp.json`)
5. Click **"Start MCP Shark"** to start the server

The UI will:

- Convert your MCP config format automatically
- Start the MCP server on port 9851
- Display server logs in real-time
- Allow you to stop/restart the server

**Note:** The MCP server is started as a child process by the UI server. When you stop the UI, the MCP server will also be stopped automatically.

### Environment Variables

- `UI_PORT`: Port for the server (default: `9853`)
- `DB_PATH`: Path to the SQLite database file (default: `~/.mcp-shark/db/mcp-shark.sqlite`)

## 📡 API Endpoints

### Traffic & Monitoring

- `GET /api/requests` - Retrieve communication requests/responses with optional filtering
- `GET /api/conversations` - Get request/response conversation pairs
- `GET /api/sessions` - List all sessions
- `GET /api/statistics` - Get traffic statistics

### MCP Server Management

- `GET /api/composite/status` - Get the status of the MCP Shark server
- `GET /api/composite/logs` - Get MCP Shark server logs
- `POST /api/composite/setup` - Configure and start the MCP Shark server
- `POST /api/composite/stop` - Stop the MCP Shark server
- `POST /api/composite/logs/clear` - Clear server logs

### Configuration

- `GET /api/config/detect` - Detect default MCP config file paths
- `GET /api/config/read` - Read MCP configuration file

## 🔌 WebSocket

The server broadcasts real-time updates via WebSocket on the same port as the HTTP server.

**Connection:**

- Development: `ws://localhost:9853`
- Production: `wss://your-domain.com` (if using HTTPS)

**Message Format:**

```json
{
  "type": "update",
  "data": [
    /* array of log entries */
  ]
}
```

## 🎨 UI Features

### Filtering

- **Server**: Filter by server name
- **Direction**: Filter by request or response
- **Method**: Filter by HTTP method (GET, POST, etc.)
- **Status**: Filter by status (success, error, pending)

### Log Table

Displays:

- Timestamp
- Server name
- Direction (request/response)
- HTTP method
- Status (color-coded)
- Duration (ms)
- Payload size (KB)

### Log Detail Panel

Click any log entry to view:

- Full log metadata
- Request ID
- Error messages (if any)
- Formatted JSON payload

## 📁 Project Structure

```
ui/
├── src/
│   ├── App.jsx              # Main application component
│   ├── LogTable.jsx         # Log table component
│   ├── LogDetail.jsx        # Log detail panel component
│   ├── PacketList.jsx      # Packet list component
│   ├── PacketDetail.jsx    # Packet detail component
│   ├── CompositeLogs.jsx   # MCP Shark server logs
│   ├── CompositeSetup.jsx  # MCP Shark server setup
│   ├── TabNavigation.jsx  # Tab navigation
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── server.js                # Express server with WebSocket
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🧪 Development

### Available Scripts

- `npm run dev`: Start Vite dev server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm start`: Start the production server

### Database Schema

The application expects a SQLite database with tables for packets, conversations, and sessions. The database is created and managed by the MCP Shark server using the `mcp-shark-common` package.

The database schema includes:
- `packets`: Individual HTTP request/response packets with full metadata
- `conversations`: Correlated request/response pairs
- `sessions`: Session tracking for stateful MCP interactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC
