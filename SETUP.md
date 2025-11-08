# Setup Instructions

## Initial Setup

After cloning the repository, run:

```bash
# Install all dependencies
npm run install:all

# Initialize Husky (this will set up git hooks)
npm run prepare
```

The `prepare` script will automatically run `husky install` which sets up the git hooks.

## Git Hooks

This project uses Husky for git hooks:

- **pre-commit**: Runs lint-staged to format and lint staged files
- **commit-msg**: Validates commit messages using commitlint

## Commit Message Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
```

Examples:
- `feat(ui): add new dashboard`
- `fix(server): resolve memory leak`
- `docs: update README`
- `chore: update dependencies`

See the main README.md for more details on commit conventions.

