<div align="center">

  <img src="https://smart.mcpshark.sh/icon_512x512.png" alt="MCP Shark Logo" width="128" height="128">

  <h1>mcp-shark</h1>

  <p><strong>Security scanner for AI agent tools</strong></p>
  <p>Find vulnerabilities in your MCP server setup in under 3 seconds. 100% local, zero API calls.</p>

  [![npm version](https://img.shields.io/npm/v/@mcp-shark/mcp-shark.svg)](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
  [![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)

</div>

---

```bash
npx @mcp-shark/mcp-shark
```

<!-- Record with: vhs docs/assets/quick-demo.tape -->
<!-- ![mcp-shark scan demo](docs/assets/quick-demo.gif) -->

```
  🦈  MCP Shark Security Scanner

  IDE Detection
  ✔ Cursor (3 servers)
  ✔ Claude Desktop (1 servers)
  ✔ VS Code (2 servers)

  ⚠ CRITICAL  GitHub PAT hardcoded in config
    GITHUB_TOKEN=ghp_****  — use environment variable reference instead
    Fixable: npx mcp-shark scan --fix

  ⚠ HIGH  Toxic Flow: Slack → GitHub
    A Slack message with prompt injection could cause your agent to
    push malicious code to your repository. (Catalog §1.2, §1.3)

  Shark Score: 38/100 (D)
  ██████████░░░░░░░░░░░░░░░░░░░░

  5 critical · 3 high · 2 medium · 1 low
  Scanned 6 servers · 30 rules · 14 tools in 1ms

  Next steps:
    npx mcp-shark scan --fix          Auto-fix 3 issues
    npx mcp-shark scan --walkthrough  See full attack chains
    npx mcp-shark lock                Pin tool definitions
```

## Why mcp-shark?

**82% of MCP server setups have at least one vulnerability.** Most developers don't know.

mcp-shark finds them in seconds — no cloud, no API keys, no telemetry. Just `npx` and the truth about your AI tool security.

### The killer feature: Toxic Flow Analysis

No other tool does this. mcp-shark analyzes how your MCP servers **interact with each other** to find cross-server attack paths:

```
  ⚠ HIGH  Slack → GitHub
    A Slack message with prompt injection could cause your agent to
    push malicious code to your repository.

  ⚠ MEDIUM  Browser → FileSystem
    Untrusted web content could be used to overwrite local files
    through agent tool chaining.
```

These aren't theoretical — they're the [#1 and #3 most exploited MCP vulnerabilities](https://equixly.com/blog/2025/03/29/mcp-security-risks/) in production.

## Features

| Feature | Description |
|---------|-------------|
| **30 security rules** | OWASP MCP Top 10 + Agentic Security Initiative + general checks |
| **Toxic flow analysis** | Cross-server attack path detection (exclusive) |
| **Attack walkthroughs** | Personalized multi-step exploit narratives |
| **Shark Score** | Transparent security posture score (0-100, A-F) |
| **Auto-fix** | `--fix` replaces hardcoded secrets, fixes permissions, with backup/undo |
| **Tool pinning** | Git-committable `.mcp-shark.lock` with SHA-256 hashes |
| **15 IDE detection** | Cursor, Claude Desktop, VS Code, Windsurf, Codex, and 10 more |
| **3 output formats** | Terminal (beautiful), JSON, SARIF v2.1.0 |
| **Health checks** | `doctor` command for environment validation |
| **Server inventory** | `list` command shows all servers in a table |
| **Watch mode** | Live re-scan on config changes |
| **HTML reports** | Self-contained offline security reports |
| **YAML rules** | Community-contributed rules via `.mcp-shark/rules/` |
| **GitHub Action** | CI/CD integration with SARIF upload |
| **Web UI** | Wireshark-like monitoring interface |
| **100% local** | Zero network calls, zero telemetry, always offline |

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

# Watch for config changes
npx @mcp-shark/mcp-shark watch

# Generate HTML report
npx @mcp-shark/mcp-shark scan --format html --output report.html

# CI mode (exits 1 on critical/high)
npx @mcp-shark/mcp-shark scan --ci --format sarif
```

## Commands

| Command | Description |
|---------|-------------|
| `scan` (default) | Run security scan with 30+ rules |
| `lock` | Create `.mcp-shark.lock` file |
| `lock --verify` | Verify current state matches lockfile |
| `diff` | Show tool definition changes since last lock |
| `doctor` | Run environment health checks |
| `list` | Show inventory of all detected servers |
| `watch` | Watch config files and re-scan on changes |
| `serve` | Start the web monitoring UI |

## Scan Flags

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

## Comparison

| Capability | mcp-scan | mcp-context-protector | Oxvault | **mcp-shark** |
|------------|----------|-----------------------|---------|---------------|
| Runtime | Python (`uvx`) | Python (`pip`) | Go (binary) | **Node.js (`npx`)** |
| First result | ~10s | N/A (proxy) | ~5s | **<3s** |
| Security rules | 15 | 0 (proxy only) | SAST | **30+ rules** |
| **Toxic flow analysis** | — | — | — | **Yes** |
| **Attack walkthroughs** | — | — | — | **Yes** |
| **Auto-fix** | — | — | — | **Yes** |
| Tool pinning | Hash-based | TOFU | — | **Git-committable lockfile** |
| TOFU proxy | — | Yes | — | Yes (web UI) |
| YARA engine | — | — | — | **Yes** |
| Web UI | — | — | — | **Yes** |
| Confidence levels | — | — | Scores | **confirmed/advisory** |
| IDE detection | ~16 | ~5 | N/A | **15** |
| Output formats | JSON | — | JSON | **Terminal + JSON + SARIF + HTML** |
| Health check | — | — | — | **Yes** |
| GitHub Action | — | — | — | **Yes** |
| Watch mode | — | — | — | **Yes** |
| **100% offline** | `--local-only` | Yes | Yes | **Always** |

**Bold = features no competitor has.**

## Custom YAML Rules

Create `.mcp-shark/rules/` in your project to add custom security rules:

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

Rules are loaded automatically on scan. Share them with your team by committing the folder.

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
| VS Code | `~/.vscode/mcp.json` | ✅ |
| Windsurf | `~/.windsurf/mcp.json` | ✅ |
| Claude Code | `~/.claude.json` | ✅ |
| Codex | `~/.codex/config.toml` | ✅ |
| Continue | `~/.continue/config.json` | ✅ |
| Zed | `~/.config/zed/settings.json` | ✅ |
| Cline | `~/.cline/mcp_settings.json` | ✅ |
| Roo Code | `~/.roo-code/mcp.json` | ✅ |
| Amazon Q | `~/.aws/q/mcp.json` | ✅ |
| Gemini CLI | `~/.gemini/settings.json` | ✅ |
| Kilo Code | `~/.kilo-code/mcp.json` | ✅ |
| Augment | `~/.augment/mcp.json` | ✅ |
| Trae | `~/.trae/mcp.json` | ✅ |

## Security Rules (30+)

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
- Local security analysis with YARA detection
- API documentation with interactive testing

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
