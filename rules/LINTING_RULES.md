# Linting Rules

## Unused Variables and Methods Detection

The project uses strict ESLint rules to detect and fail on unused variables, methods, and expressions.

### Configuration

The ESLint configuration (`.eslintrc.json`) includes:

- **`no-unused-vars`**: Set to `"error"` - Fails on unused variables
  - Variables prefixed with `_` are ignored (e.g., `_unusedVar`)
  - Function arguments prefixed with `_` are ignored (e.g., `function test(_unusedArg)`)
  - Caught errors prefixed with `_` are ignored (e.g., `catch (_err)`)
  - Only unused arguments after used ones are flagged

- **`no-unused-expressions`**: Set to `"error"` - Fails on unused expressions

- **`@next/next/no-unused-vars`**: Set to `"error"` - Next.js specific unused variable detection

### Build Behavior

- **Development**: Run `npm run lint` to check for linting errors
- **Build**: The build process (`npm run build`) will fail if linting errors are detected
  - This is controlled by `eslint.ignoreDuringBuilds: false` in `next.config.js`

### Ignoring Variables

To intentionally ignore a variable (e.g., for future use or API compatibility):

```javascript
// Prefix with underscore
const _unusedVariable = someValue;

// Function parameter
function handler(req, _res, next) {
  // _res is intentionally unused
}

// Caught error
try {
  // ...
} catch (_err) {
  // Error intentionally ignored
}
```

### Best Practices

1. Remove unused code rather than ignoring it
2. Use `_` prefix only when necessary (e.g., required function signatures)
3. Run `npm run lint` before committing
4. Fix all linting errors before deployment

