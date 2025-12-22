# Package Inspection Guide

This guide explains how to inspect the final built package before publishing to npm.

## Quick Methods

### 1. Create and Inspect Package Tarball

**Create the package tarball:**
```bash
npm pack
```

This creates a `.tgz` file (e.g., `mcp-shark-mcp-shark-1.5.4.tgz`) that contains exactly what would be published.

**List all files in the package:**
```bash
tar -tzf mcp-shark-mcp-shark-*.tgz
```

**Count total files:**
```bash
tar -tzf mcp-shark-mcp-shark-*.tgz | wc -l
```

**View first 50 files:**
```bash
tar -tzf mcp-shark-mcp-shark-*.tgz | head -50
```

**Check specific directories:**
```bash
tar -tzf mcp-shark-mcp-shark-*.tgz | grep "^package/bin"
tar -tzf mcp-shark-mcp-shark-*.tgz | grep "^package/core"
tar -tzf mcp-shark-mcp-shark-*.tgz | grep "^package/ui"
```

### 2. Extract and Inspect Package

**Extract the package:**
```bash
npm pack
mkdir -p .package-inspect
tar -xzf mcp-shark-mcp-shark-*.tgz -C .package-inspect
```

Then inspect the extracted contents:
```bash
ls -la .package-inspect/package/
tree .package-inspect/package/  # if tree is installed
```

**Check package size:**
```bash
du -sh .package-inspect/package/
```

**Verify critical files exist:**
```bash
test -f .package-inspect/package/bin/mcp-shark.js && echo "✓ bin/mcp-shark.js exists"
test -f .package-inspect/package/core/mcp-server/index.js && echo "✓ core/mcp-server/index.js exists"
test -f .package-inspect/package/ui/dist/index.html && echo "✓ UI built files exist"
test -f .package-inspect/package/README.md && echo "✓ README.md exists"
test -f .package-inspect/package/LICENSE && echo "✓ LICENSE exists"
```

### 3. Dry Run Publish

**See what npm would publish (without creating tarball):**
```bash
npm publish --dry-run
```

This shows:
- Files that would be included
- Package size
- Dependencies
- But doesn't create a tarball

### 4. Using npm Scripts

We've added convenient scripts to `package.json`:

**Quick inspection (shows first 50 files and total count):**
```bash
npm run pack:inspect
```

**List all files:**
```bash
npm run pack:list
```

**Extract package for detailed inspection:**
```bash
npm run pack:extract
```

Then inspect `.package-inspect/package/` directory.

## What Gets Included

Based on the `files` field in `package.json`, the following are included:

- `bin/` - Binary executables
- `ui/` - UI source and built files
- `core/` - Core application code
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package manifest

**Excluded:**
- `node_modules/` (installed by consumers)
- `docs/` (documentation not needed in package)
- `rules/` (development rules)
- `scripts/` (development scripts)
- `.git/` (version control)
- Test files
- Development configuration files

## Verification Checklist

Before publishing, verify:

- [ ] `bin/mcp-shark.js` exists and is executable
- [ ] `core/mcp-server/index.js` exists (for `./mcp-server` export)
- [ ] `ui/dist/` contains built UI files
- [ ] `README.md` is included
- [ ] `LICENSE` is included
- [ ] No sensitive files (API keys, secrets) are included
- [ ] No development-only files are included
- [ ] Package size is reasonable (check with `du -sh`)

## Cleanup

After inspection, clean up:

```bash
rm -f mcp-shark-mcp-shark-*.tgz
rm -rf .package-inspect
```

## Example Workflow

```bash
# 1. Build UI (if not already built)
npm run build:ui

# 2. Create and inspect package
npm run pack:inspect

# 3. Extract for detailed inspection
npm run pack:extract

# 4. Verify critical files
ls -la .package-inspect/package/bin/
ls -la .package-inspect/package/ui/dist/

# 5. Check package size
du -sh .package-inspect/package/

# 6. Clean up
rm -f mcp-shark-mcp-shark-*.tgz
rm -rf .package-inspect

# 7. If everything looks good, publish
npm run publish:dry-run  # Final check
npm run publish:public   # Actual publish
```

