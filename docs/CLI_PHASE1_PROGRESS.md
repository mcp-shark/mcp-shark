# CLI Phase 1 Progress — Local-Only Scanner

**Status:** ✅ Complete
**Branch:** `feature/local-only-cli-scanner`
**Last Updated:** 2026-04-04

## Phase Overview

Build the CLI scanner foundation for the local-only 10K-star feature set. Default `npx mcp-shark` runs a security scan instead of starting the web server.

## Sub-Phase Breakdown

| Sub-Phase | Status | Details |
|-----------|--------|---------|
| Git branch creation | ✅ | `feature/local-only-cli-scanner` from `main` |
| CLI dependencies | ✅ | kleur, boxen, cli-table3, figures, gradient-string |
| IDE auto-detection (3→15) | ✅ | 15 IDEs with cross-platform path resolution |
| Commander subcommands | ✅ | scan (default), lock, diff, doctor, serve |
| CLI output layer | ✅ | Banner, Formatter, JsonFormatter (JSON + SARIF) |
| ScanService | ✅ | Orchestrates config→rules→toxic flows→score |
| ScanCommand | ✅ | Wires ScanService to CLI with all flags |
| ToxicFlowAnalyzer | ✅ | Tool classification DB + composition risk analysis |
| ToolClassifications | ✅ | 15 MCP server tool mappings built-in |
| SharkScoreCalculator | ✅ | Transparent formula, grades A-F |
| WalkthroughGenerator | ✅ | 5 attack chain templates with personalized narratives |
| DoctorCommand | ✅ | IDE checks, env checks, security checks |
| LockCommand | ✅ | Create, verify, diff lockfile operations |
| Lint check | ✅ | 198 files pass biome lint |
| Build check | ✅ | vite build succeeds |

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `core/cli/index.js` | 11 | Barrel file for CLI module |
| `core/cli/IdeConfigPaths.js` | 155 | 15 IDE config path definitions |
| `core/cli/ConfigScanner.js` | 152 | Config file detection and parsing |
| `core/cli/ScanService.js` | 161 | Scan orchestration service |
| `core/cli/ScanCommand.js` | 124 | CLI scan command handler |
| `core/cli/ToxicFlowAnalyzer.js` | 156 | Cross-server toxic flow detection |
| `core/cli/ToolClassifications.js` | 117 | Built-in tool capability database |
| `core/cli/SharkScoreCalculator.js` | 95 | Shark Score formula and grading |
| `core/cli/WalkthroughGenerator.js` | 165 | Attack chain narrative generation |
| `core/cli/DoctorCommand.js` | 195 | Environment health check command |
| `core/cli/LockCommand.js` | 216 | Lockfile create/verify/diff commands |
| `core/cli/output/index.js` | 14 | Output module barrel file |
| `core/cli/output/Banner.js` | 57 | Gradient banner display |
| `core/cli/output/Formatter.js` | 148 | Terminal output formatting |
| `core/cli/output/JsonFormatter.js` | 91 | JSON and SARIF formatters |

## Files Modified

| File | Change |
|------|--------|
| `bin/mcp-shark.js` | Restructured with commander subcommands; scan as default |
| `package.json` | Added kleur, cli-table3, boxen, figures, gradient-string |

## CLI Commands Available

```bash
npx mcp-shark                    # scan (default)
npx mcp-shark scan               # explicit scan
npx mcp-shark scan --fix         # scan + auto-fix (engine ready, handlers pending)
npx mcp-shark scan --walkthrough # attack chain narratives
npx mcp-shark scan --ci          # CI mode (exit 1 on critical/high)
npx mcp-shark scan --format json # JSON output
npx mcp-shark scan --format sarif # SARIF output
npx mcp-shark lock               # create lockfile
npx mcp-shark lock --verify      # verify against lockfile
npx mcp-shark diff               # show changes since lock
npx mcp-shark doctor             # environment health checks
npx mcp-shark serve              # web UI (existing)
```

## IDE Support (15 total)

| IDE | Parser | Status |
|-----|--------|--------|
| Cursor | JSON | Existing (enhanced) |
| Claude Desktop | JSON | New |
| Claude Code | JSON | New |
| VS Code | JSON | New |
| Windsurf | JSON | Existing (enhanced) |
| Codex | TOML | Existing (enhanced) |
| Gemini CLI | JSON embedded | New |
| Continue | JSON embedded | New |
| Cline | JSON | New |
| Amp | JSON | New |
| Kiro | JSON | New |
| Zed | JSON embedded | New |
| Augment | JSON | New |
| Roo Code | JSON | New |
| Project-local | JSON | New |

## Next Steps (Phase 2)

- [ ] Wire `scan --fix` auto-remediation handlers (env var replacement, chmod, .gitignore)
- [ ] Add 6+ new security rules to reach 30+ total
- [ ] Implement `--walkthrough` flag rendering in terminal output
- [ ] Add score improvement display after `--fix`
- [ ] Windows testing and path resolution
- [ ] README rewrite with comparison table and GIF
