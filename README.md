<div align="center">

  <img src="https://smart.mcpshark.sh/icon_512x512.png" alt="MCP Shark Logo" width="128" height="128">

  <h1>mcp-shark</h1>

  <p><strong>Security scanner for AI agent tools</strong></p>
  <p>Find vulnerabilities in your MCP server setup in under 3 seconds. 100% local scans, zero telemetry.</p>

  [![npm version](https://img.shields.io/npm/v/@mcp-shark/mcp-shark.svg)](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
  [![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)

</div>

---

```bash
npx @mcp-shark/mcp-shark
```

![mcp-shark demo](docs/assets/demo.gif)

## Why mcp-shark?

**82% of MCP server setups have at least one vulnerability.** Most developers don't know.

mcp-shark finds them in seconds — no cloud, no API keys, no telemetry. Just `npx` and the truth about your AI tool security.

### The killer feature: Toxic Flow Analysis

No other tool does this. mcp-shark analyzes how your MCP servers **interact with each other** to find cross-server attack paths:

```
  ▲ HIGH  Slack → GitHub
    A Slack message with prompt injection could cause your agent to
    push malicious code to your repository.

  ▲ MEDIUM  Browser → FileSystem
    Untrusted web content could be used to overwrite local files
    through agent tool chaining.
```

These aren't theoretical — they're the [#1 and #3 most exploited MCP vulnerabilities](https://equixly.com/blog/2025/03/29/mcp-security-risks/) in production.

## Features

| Feature | Description |
|---------|-------------|
| **35 security rules** | OWASP MCP Top 10 + Agentic Security Initiative + general checks |
| **Toxic flow analysis** | Cross-server attack path detection (exclusive) |
| **Attack walkthroughs** | Personalized multi-step exploit narratives |
| **Shark Score** | Transparent security posture score (0-100, A-F) |
| **Auto-fix** | `--fix` replaces hardcoded secrets, fixes permissions, with backup/undo |
| **Tool pinning** | Git-committable `.mcp-shark.lock` with SHA-256 hashes |
| **15 IDE detection** | Cursor, Claude Desktop, VS Code, Windsurf, Codex, Amp, Kiro, and more |
| **4 output formats** | Terminal, JSON, SARIF v2.1.0, HTML |
| **Health checks** | `doctor` command for environment validation |
| **Server inventory** | `list` command shows all servers in a table |
| **Watch mode** | Live re-scan on config changes |
| **HTML reports** | Self-contained offline security reports |
| **Downloadable rule packs** | `update-rules` fetches latest OWASP/Agentic catalogs — zero code changes |
| **YAML rules** | Per-project custom rules via `.mcp-shark/rules/` |
| **GitHub Action** | CI/CD integration with SARIF upload |
| **Interactive TUI** | lazygit-style terminal UI for scan, fix, and server browsing |
| **Web UI** | Wireshark-like monitoring interface |
| **100% local** | Scans are fully offline; rule updates are opt-in via `update-rules` |

## Quick Start

```bash
# Scan your MCP setup (default command)
npx @mcp-shark/mcp-shark

# Auto-fix issues (with interactive confirmation)
npx @mcp-shark/mcp-shark scan --fix

# See full attack chain narratives
npx @mcp-shark/mcp-shark scan --walkthrough

# Pin tool definitions to detect rug pulls
npx @mcp-shark/mcp-shark lock

# Check environment health
npx @mcp-shark/mcp-shark doctor

# Show all detected servers
npx @mcp-shark/mcp-shark list

# Download latest rule packs (OWASP, Agentic Security)
npx @mcp-shark/mcp-shark update-rules

# Watch for config changes
npx @mcp-shark/mcp-shark watch

# Interactive terminal UI
npx @mcp-shark/mcp-shark tui

# Generate HTML report
npx @mcp-shark/mcp-shark scan --format html --output report.html

# CI mode (exits 1 on critical/high)
npx @mcp-shark/mcp-shark scan --ci --format sarif
```

## Commands

| Command | Description |
|---------|-------------|
| `scan` (default) | Run security scan with 35 rules |
| `lock` | Create `.mcp-shark.lock` file |
| `lock --verify` | Verify current state matches lockfile |
| `diff` | Show tool definition changes since last lock |
| `doctor` | Run environment health checks |
| `list` | Show inventory of all detected servers (`--format json` supported) |
| `update-rules` | Download latest rule packs from remote registry |
| `watch` | Watch config files and re-scan on changes |
| `tui` | Interactive terminal UI (lazygit-style) |
| `serve` | Start the web monitoring UI |

## CLI Flags

| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix issues (interactive confirmation) |
| `--fix --yes` | Auto-fix without prompting |
| `--fix --undo` | Restore backups from previous fix |
| `--walkthrough` | Show full attack chain narratives |
| `--ci` | CI mode: exit code 1 on critical/high |
| `--format <fmt>` | Output: `terminal`, `json`, `sarif`, `html` |
| `--output <path>` | Write report to file (for `html` format) |
| `--strict` | Count advisory findings in score |
| `--ide <name>` | Scan specific IDE only |
| `--rules <path>` | Load custom YAML rules |
| `--source <url>` | Custom rule registry URL (for `update-rules`) |

## Comparison

| Capability | mcp-scan | mcp-context-protector | Oxvault | **mcp-shark** |
|------------|----------|-----------------------|---------|---------------|
| Runtime | Python (`uvx`) | Python (`pip`) | Go (binary) | **Node.js (`npx`)** |
| First result | ~10s | N/A (proxy) | ~5s | **<3s** |
| Security rules | 15 | 0 (proxy only) | SAST | **35 rules** |
| **Toxic flow analysis** | — | — | — | **Yes** |
| **Attack walkthroughs** | — | — | — | **Yes** |
| **Auto-fix** | — | — | — | **Yes** |
| Tool pinning | Hash-based | TOFU | — | **Git-committable lockfile** |
| TOFU proxy | — | Yes | — | Yes (web UI) |
| Custom rule engine | — | — | — | **YAML + JSON packs** |
| Web UI | — | — | — | **Yes** |
| Confidence levels | — | — | Scores | **confirmed/advisory** |
| IDE detection | ~16 | ~5 | N/A | **15** |
| Output formats | JSON | — | JSON | **Terminal + JSON + SARIF + HTML** |
| Health check | — | — | — | **Yes** |
| GitHub Action | — | — | — | **Yes** |
| Watch mode | — | — | — | **Yes** |
| **Downloadable rule packs** | — | — | — | **Yes** |
| **100% offline** | `--local-only` | Yes | Yes | **Always (scans)** |

**Bold = features no competitor has.**

## Rule Extensibility

### Downloadable Rule Packs (JSON)

mcp-shark ships with 24 declarative rules as JSON packs (OWASP MCP, Agentic Security Initiative, General Security). New vulnerability catalogs can be added as `.json` files — no JavaScript, no code changes.

```bash
# Fetch latest rule packs from the registry
npx @mcp-shark/mcp-shark update-rules

# Use a custom/enterprise registry
npx @mcp-shark/mcp-shark update-rules --source https://internal.corp/rules/manifest.json
```

Downloaded packs are cached in `.mcp-shark/rule-packs/` and merged with built-in rules on every scan.

<details>
<summary>Rule pack JSON schema</summary>

```json
{
  "id": "owasp-mcp-2027",
  "name": "OWASP MCP Top 10 (2027)",
  "version": "1.0.0",
  "rules": [
    {
      "id": "MCP01-token-mismanagement",
      "name": "Token Mismanagement",
      "severity": "critical",
      "framework": "OWASP-MCP",
      "description": "Detects hardcoded tokens in MCP configs",
      "patterns": [
        { "regex": "(api[_-]?key|token)\\s*[:=]", "flags": "i", "label": "API key pattern" }
      ],
      "scope": ["tool", "prompt", "resource", "packet"],
      "exclude_patterns": [{ "regex": "\\$\\{|process\\.env" }],
      "match_mode": "any"
    }
  ]
}
```

</details>

### Custom YAML Rules (per-project)

Create `.mcp-shark/rules/` in your project to add lightweight custom rules:

```yaml
# .mcp-shark/rules/no-production-keys.yaml
id: custom-no-prod-keys
name: No Production Keys
severity: critical
description: Detects production API keys in MCP configs
match:
  env_pattern: "^(PROD_|PRODUCTION_)"
  value_pattern: "^sk-live|^pk-live"
message: "Production key detected in {key} — use staging keys for development"
```

Both YAML rules and JSON packs are loaded automatically on scan. Share them with your team by committing the folder.

### User-Overridable Data (`.mcp-shark/`)

Every built-in data source can be extended or overridden through YAML files in your project root:

| File | Overrides | Format |
|------|-----------|--------|
| `.mcp-shark/secrets.yaml` | Secret detection patterns | List of `{ name, regex }` |
| `.mcp-shark/classifications.yaml` | Server/tool capability tags | Nested map `server: { capability: true }` |
| `.mcp-shark/flows.yaml` | Toxic flow rules | List of `{ source_cap, target_cap, risk, ... }` |
| `.mcp-shark/rules/*.yaml` | Custom per-project rules | See YAML Rules above |
| `.mcp-shark/rule-packs/*.json` | Override or add declarative packs | See JSON Packs above |

User data is merged with built-in data at scan time. No rebuild required.

## GitHub Action

```yaml
# .github/workflows/mcp-security.yml
name: MCP Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mcp-shark/scan-action@v1
        with:
          format: sarif
          fail-on: high
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: mcp-shark-results.sarif
```

## Supported IDEs

| IDE | Config Path | Status |
|-----|-------------|--------|
| Cursor | `~/.cursor/mcp.json` | ✅ |
| Claude Desktop | `~/Library/.../claude_desktop_config.json` | ✅ |
| Claude Code | `~/.claude.json` | ✅ |
| VS Code | `~/.vscode/mcp.json` | ✅ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | ✅ |
| Codex | `~/.codex/config.toml` | ✅ |
| Gemini CLI | `~/.gemini/settings.json` | ✅ |
| Continue | `~/.continue/config.json` | ✅ |
| Cline | `~/.../saoudrizwan.claude-dev/.../cline_mcp_settings.json` | ✅ |
| Amp | `~/.amp/mcp.json` | ✅ |
| Kiro | `~/.kiro/mcp.json` | ✅ |
| Zed | `~/.config/zed/settings.json` | ✅ |
| Augment | `~/.augment/mcp.json` | ✅ |
| Roo Code | `~/.roo-code/mcp.json` | ✅ |
| Project (local) | `./mcp.json`, `./.mcp.json`, `./.mcp/config.json` | ✅ |

## Security Rules (35)

<details>
<summary>Full rule list</summary>

### OWASP MCP Top 10
| ID | Rule | Severity |
|----|------|----------|
| MCP01 | Token Mismanagement | Critical |
| MCP02 | Scope Creep | High |
| MCP03 | Tool Poisoning | Critical |
| MCP04 | Supply Chain | High |
| MCP05 | Command Injection | Critical |
| MCP06 | Prompt Injection | High |
| MCP07 | Insufficient Auth | High |
| MCP08 | Lack of Audit | Medium |
| MCP09 | Shadow Servers | High |
| MCP10 | Context Injection | High |

### Agentic Security Initiative (ASI)
| ID | Rule | Severity |
|----|------|----------|
| ASI01 | Goal Hijack | Critical |
| ASI02 | Tool Misuse | High |
| ASI03 | Identity Abuse | High |
| ASI04 | Supply Chain | High |
| ASI05 | Remote Code Execution | Critical |
| ASI06 | Memory Poisoning | High |
| ASI07 | Insecure Communication | Medium |
| ASI08 | Cascading Failures | Medium |
| ASI09 | Trust Exploitation | High |
| ASI10 | Rogue Agent | Critical |

### General Security
| Rule | Severity |
|------|----------|
| Hardcoded Secrets | Critical |
| Command Injection | Critical |
| Cross-Server Shadowing | High |
| Tool Name Ambiguity | Medium |
| DNS Rebinding | High |
| ANSI Escape Sequences | Medium |
| Config File Permissions | Medium |
| Missing Containment | High |
| Duplicate Tool Names | Medium |
| Shell/Env Injection | High |
| Excessive Permissions | High |
| Unsafe Default Config | Medium |
| Path Traversal | High |
| Sensitive Data Exposure | High |
| Insecure Transport | Medium |

</details>

## Web UI

MCP Shark also includes a Wireshark-like web interface for real-time MCP traffic monitoring:

```bash
npx @mcp-shark/mcp-shark serve --open
```

The web UI provides:
- Multi-server aggregation and real-time monitoring
- Interactive playground for testing tools, prompts, and resources
- Local security analysis with pattern-based detection
- API documentation with interactive testing

## Architecture

```
┌────────────────────────────────────────────────────┐
│  CLI (Commander.js)                                │
│  scan · lock · diff · doctor · list · watch · tui  │
│  update-rules · serve                              │
├──────────────┬──────────────┬──────────────────────┤
│  ConfigScanner│  ScanService  │  StaticRulesService  │
│  15 IDEs      │  orchestrator │  35 rules            │
├──────────────┴──────────────┴──────────────────────┤
│  Data layer (all JSON, all overridable)            │
│  ┌────────────┬──────────────┬───────────────────┐ │
│  │ rule-packs │ secret-      │ tool-             │ │
│  │ (24 rules) │ patterns.json│ classifications   │ │
│  ├────────────┼──────────────┼───────────────────┤ │
│  │ toxic-flow │ rule-        │ .mcp-shark/*.yaml │ │
│  │ rules.json │ sources.json │ (user overrides)  │ │
│  └────────────┴──────────────┴───────────────────┘ │
├────────────────────────────────────────────────────┤
│  JS plugins (11 rules needing algorithmic logic)   │
│  + DeclarativeRuleEngine (24 pattern-based rules)  │
└────────────────────────────────────────────────────┘
```

**Design principles:**
- **Data-driven** — Security rules, secret patterns, tool classifications, and toxic flow rules are all JSON files. No source changes needed to add or update rules.
- **User-overridable** — Every built-in data file has a corresponding `.mcp-shark/*.yaml` override path.
- **Hybrid rule engine** — Pattern-matching rules (24) live as declarative JSON packs. Algorithmic rules (11) that need code logic remain as JS plugins. Both are loaded and merged transparently.
- **Zero-config scanning** — `npx` and go. Auto-detects all 15 IDEs and project-local configs.

## Documentation

- **[Getting Started](docs/getting-started.md)** — Installation & setup
- **[Features](docs/features.md)** — Detailed feature documentation
- **[User Guide](docs/user-guide.md)** — Complete usage guide
- **[Local Analysis](docs/local-analysis.md)** — Static security analysis
- **[Architecture](docs/architecture.md)** — System design
- **[API Reference](docs/api-reference.md)** — API endpoints

## Requirements

- **Node.js**: 20.0.0 or higher
- **OS**: macOS, Windows, or Linux

## License

Source-Available Non-Commercial License

- ✅ View, fork, modify, run for personal, educational, or internal company use
- ❌ Sell, resell, or integrate into paid products/services without written permission

See [LICENSE](LICENSE) for full terms.

## Support

- **Issues**: [GitHub Issues](https://github.com/mcp-shark/mcp-shark/issues)
- **Website**: [mcpshark.sh](https://mcpshark.sh)

---

<div align="center">
  <strong>Your AI tools are talking to each other. mcp-shark shows you when that's dangerous.</strong>
</div>
