# Development

Developer guide for contributing to MCP Shark.

## Setup

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: Comes with Node.js
- **Git**: For version control

### Installation

From the root directory:

```bash
# Install all dependencies
npm install
```

### Available Scripts

```bash
# Start the application (builds UI and starts server)
npm start

# Development mode (with hot reload)
npm run dev

# Build UI for production
npm run build

# Build UI only
npm run build:ui

# Linting and formatting
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run check         # Check linting and formatting
npm run check:fix     # Fix linting and formatting issues
```

## Project Structure

```
mcp-shark/
├── bin/                    # CLI executable
│   └── mcp-shark.js
├── core/mcp-server/      # MCP server library (core component)
│   ├── index.js           # Library entry point
│   ├── mcp-shark.js       # Server entry point
│   └── lib/               # Server implementation
├── ui/                     # Web UI
│   ├── server.js          # Express server
│   ├── src/               # React frontend
│   └── vite.config.js     # Vite configuration
├── lib/common/            # Common utilities
│   ├── logger.js          # Unified logger implementation
│   ├── configs/           # Configuration management
│   └── db/                # Database utilities
├── scripts/                # Build scripts
│   └── start-ui.js
├── docs/                   # Documentation
└── package.json
```

## Technology Stack

**MCP Server:**
- Express.js for HTTP server
- Model Context Protocol SDK
- SQLite for audit logging

**UI:**
- React 18 for frontend
- Vite for build tooling
- Express.js for backend API
- WebSocket (ws) for real-time updates
- SQLite (better-sqlite3) for database

**Code Quality:**
- Biome for linting and formatting
- Husky for git hooks
- Commitlint for conventional commits

## Code Quality Standards

### Linting Rules

The project uses Biome for linting and formatting. See [LINTING_RULES.md](../rules/LINTING_RULES.md) for details.

**Key Rules:**
- No unused variables (prefix with `_` to ignore)
- No unused expressions
- Strict dependency checking for React hooks

### Coding Rules

See [CODING_RULES.md](../rules/CODING_RULES.md) for complete coding standards.

**Key Rules:**
- Always use `const` (never `let` or `var`)
- File size limits: Backend 250 lines, Frontend 300 lines
- Use barrel files for exports
- Multiline conditionals with braces
- No IIFEs
- Proper error handling with try-catch

### Running Checks

```bash
# Check linting
npm run lint

# Check formatting
npm run format

# Check both
npm run check

# Fix issues
npm run check:fix
```

## Git Workflow

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(playground): add tool testing capabilities
fix(server): resolve infinite loop in request handling
docs(readme): update installation instructions
```

### Pre-commit Hooks

Husky runs pre-commit hooks that:
- Run Biome checks
- Format code automatically
- Validate commit messages

## Testing

### Manual Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test features in the UI at `http://localhost:9853`

3. Check logs for errors

### Code Review Checklist

- [ ] Code follows coding rules
- [ ] No linting errors
- [ ] File sizes within limits
- [ ] Proper error handling
- [ ] Documentation updated if needed
- [ ] Commit message follows conventional format

## API Development

### Adding New Endpoints

1. Create route file in `ui/server/routes/`
2. Export route handler function
3. Register route in `ui/server.js`
4. Update API documentation in `docs/api-reference.md`

### Adding New Features

1. Follow file size limits (split if needed)
2. Use barrel files for exports
3. Follow React hooks best practices
4. Add proper error handling
5. Update documentation

## Database Schema

The database schema is managed in `lib/common/db/init.js`. See the schema definition for details.

## Debugging

### Server Debugging

- Check logs in "MCP Shark Logs" tab
- Use browser DevTools for frontend debugging
- Check database directly for data issues

### Common Issues

- **Port conflicts**: Change ports in environment variables
- **Database locks**: Ensure only one process accesses database
- **Build errors**: Clear node_modules and reinstall

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

**Process:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run check:fix`
5. Commit with conventional format
6. Push and create a pull request

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md): Contribution guidelines
- [DEVELOPERS.md](../DEVELOPERS.md): Developer setup guide
- [SETUP.md](../SETUP.md): Initial setup instructions
- [rules/CODING_RULES.md](../rules/CODING_RULES.md): Coding standards
- [rules/LINTING_RULES.md](../rules/LINTING_RULES.md): Linting rules

