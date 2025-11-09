# Contributing to MCP Shark

We welcome contributions! Here's how you can help:

## Getting Started

1. **Fork the repository**
2. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Follow the code style and conventions
   - Write clear commit messages using Conventional Commits
   - Test your changes thoroughly

4. **Ensure code quality:**

   ```bash
   npm run lint:server
   npm run format:server
   ```

5. **Commit your changes:**

   ```bash
   git commit -m "feat(scope): your feature description"
   ```

6. **Push to your fork:**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request:**
   - Provide a clear description of your changes
   - Reference any related issues
   - Ensure all checks pass

## Development Guidelines

- **Code Style**: Follow the existing code style and use Prettier for formatting
- **Testing**: Test your changes before submitting
- **Documentation**: Update documentation for any new features or changes
- **Performance**: Consider performance implications of your changes
- **Compatibility**: Ensure changes work across different platforms (macOS, Linux, Windows)

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

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

**Examples:**

```bash
feat(ui): add dark mode toggle
fix(server): resolve memory leak in session handling
docs(readme): update installation instructions
refactor(mcp-server): simplify error handling
chore: update dependencies
```

## Pre-commit Hooks

Before each commit, the following checks run automatically:

1. **Fix All**: Runs `npm run fix:all` to fix linting and formatting issues in all files (continues on error)
2. **Lint-staged**: Runs Prettier on staged files to ensure consistent formatting
3. **Commitlint**: Validates commit message format (non-blocking)

The hooks are configured to be non-blocking - they will attempt to fix issues automatically and won't block your commit if tools are unavailable. However, it's recommended to ensure your code is properly formatted before committing.

## Code Quality

This project uses:

- **ESLint**: Code linting with Prettier integration
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation
