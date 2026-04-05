<div align="center">

  <img src="https://smart.mcpshark.sh/icon_512x512.png" alt="MCP Shark Logo" width="128" height="128">

  <h1>mcp-shark</h1>

 <p><strong>Security scanner for AI agent tools</strong> — static analysis on MCP configs and tool metadata on your machine (findings, toxic-flow heuristics, CI-friendly outputs). Use the <strong>local HTTP proxy</strong> and <strong>monitoring UI</strong> to aggregate IDE traffic to multiple MCP servers and inspect requests and responses in one place.</p>
  <p><strong>Privacy:</strong> static scans need no cloud and send no telemetry. Refreshing rule catalogs is opt-in HTTPS (<code>update-rules</code>).</p>

  [![npm version](https://img.shields.io/npm/v/@mcp-shark/mcp-shark.svg)](https://www.npmjs.com/package/@mcp-shark/mcp-shark)
  [![License: Non-Commercial](https://img.shields.io/badge/License-Non--Commercial-red.svg)](LICENSE)

</div>

---

```bash
npx @mcp-shark/mcp-shark
```

![mcp-shark demo](docs/assets/demo.gif)

## Why mcp-shark?

MCP setups commonly mix secrets, broad tool access, and multiple servers in one agent context; issues are easy to miss without checking configs. See the [OWASP MCP Top 10](https://owasp.org/www-project-mcp-top-10/) for a structured view of what can go wrong.

mcp-shark runs on your machine — no API keys or hosted scan backend. Install with `npx` and review findings locally.

### Toxic flow analysis

The scanner models how MCP servers **compose in the agent context** and flags risky capability pairings (for example, secret access combined with external egress):

```
  ▲ HIGH  notify-server → repo-server
    Untrusted content in one tool’s channel could lead the agent to
    take a destructive action in another (e.g. push code).

  ▲ MEDIUM  browser-server → filesystem-server
    Web-sourced context could be chained into local file operations.
```

Use mcp-shark findings as input to your own threat model, not as a complete audit.

## Features

| Feature | Description |
|---------|-------------|
| **35 security rules** | OWASP MCP Top 10 + Agentic Security Initiative + general checks |
| **Toxic flow analysis** | Cross-server attack path detection from tool capability heuristics |
| **Attack walkthroughs** | Step-by-step exploit narratives from findings |
| **Shark Score** | Transparent security posture score (0-100, A-F) |
| **Auto-fix** | `--fix` replaces hardcoded secrets, fixes permissions, with backup/undo |
| **Tool pinning** | Git-committable `.mcp-shark.lock` with SHA-256 hashes |
| **15 IDE detection** | Cursor, Claude Desktop, VS Code, Windsurf, Codex, Amp, Kiro, and more |
| **4 output formats** | Terminal, JSON, SARIF v2.1.0, HTML |
| **Health checks** | `doctor` command for environment validation |
| **Server inventory** | `list` command shows all servers in a table |
| **Watch mode** | Live re-scan on config changes |
| **HTML reports** | Self-contained offline security reports |
| **Downloadable rule packs** | [Rule pack registry](https://github.com/mcp-shark/rule-packs) (manifest + JSON); `update-rules` syncs declarative packs and toxic-flow heuristics — zero code changes |
| **YAML rules** | Per-project custom rules via `.mcp-shark/rules/` |
| **GitHub Action** | CI/CD integration with SARIF upload |
| **Interactive TUI** | lazygit-style terminal UI for scan, fix, and server browsing |
| **Web UI** | Wireshark-like monitoring interface |
| **Proxy toxic flows** | Local Analysis panel + `GET/POST /api/security/traffic-toxic-flows*` infer cross-server pairs from captured **tools/list** traffic (see [docs/local-analysis.md](docs/local-analysis.md)) |
| **Local static scans** | No hosted scan backend; `update-rules` is opt-in HTTPS to the registry |

## Quick Start

```bash
# Scan your MCP setup (default command)
npx @mcp-shark/mcp-shark

# Auto-fix issues (with interactive confirmation)
npx @mcp-shark/mcp-shark scan --fix

# See full attack chain narratives
npx @mcp-shark/mcp-shark scan --walkthrough

# Pin tool definitions (lockfile) to spot unexpected changes
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

## CLI flags

### `scan` (default command)

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
| `--rules <path>` | Load custom YAML rules from directory |
| `--refresh-rules` | Fetch rule packs from registry before scan (HTTPS; see rule registry config) |

### Other commands

| Command | Flags / notes |
|---------|----------------|
| `list` | `--format terminal` or `--format json` |
| `update-rules` | `--source <url>` for a custom pack manifest |
| `serve` | `--open` / `-o` to open the browser |
| `lock` | `--verify` to check lockfile match |

## How `scan` works

The CLI **`scan`** command is **static**: it reads MCP entries from your IDE config files (see [Supported IDEs](#supported-ides) and optional project `./mcp.json`) and analyzes **what is written there**. It does **not** connect to running MCP servers or call `tools/list`.

- **Always scanned:** each server block’s `command`, `args`, `env`, `url`, and related fields (secrets in `env`, unsafe spawn patterns, HTTP URLs, etc.).
- **Tool-level rules** (declarative packs, command-injection heuristics, toxic-flow classification from tool **names**, etc.) run only when that server entry includes an embedded **`tools`** array (name, description, schemas). If `tools` is omitted—typical for `command`/`stdio`-only configs—the scan may report **0 tools checked** even though Cursor is running the server fine.

To exercise full rule coverage in CI or test repos, either embed tool metadata in the same JSON your scanner reads, or use a project-local `mcp.json` harness (see `--ide Project`).

## What it covers

mcp-shark is aimed at **config and metadata you already have on disk** (plus optional local monitoring). It helps catch common misconfigurations and risky combinations; treat output as input to your own review, not a guarantee nothing is wrong.

| Area | Notes |
|------|--------|
| Install / run | Node.js 20+; `npx @mcp-shark/mcp-shark` |
| Security rules | 35 checks — 24 declarative JSON packs, 11 JS where heuristics need code |
| Toxic flow analysis | Heuristic cross-server paths; quality depends on embedded `tools` / classifications |
| Attack walkthroughs | Narratives derived from findings |
| Auto-fix | Supported for a subset of issues; confirm changes in your repo |
| Tool pinning | `.mcp-shark.lock` with SHA-256 hashes |
| Live traffic | Web UI (`serve`) for monitoring; separate from static `scan` |
| Custom rules | YAML under `.mcp-shark/rules/` and JSON rule packs |
| Findings & score | confirmed / advisory tiers plus Shark Score (0–100, A–F) |
| IDE configs | 15 built-in paths + project-local `mcp.json` variants — see [Supported IDEs](#supported-ides) |
| Output | Terminal, JSON, SARIF v2.1.0, HTML |
| Health | `doctor` for environment checks |
| CI | `scan --ci` and optional [GitHub Action](#github-action) |
| Watch | Re-scan when config files change |
| Rule updates | `update-rules` (optional HTTPS fetch; static scan works without it) |

## Rule Extensibility

### Downloadable Rule Packs (JSON)

The canonical **registry** (manifest, pack files, validation CI, and schema notes) lives in **[mcp-shark/rule-packs](https://github.com/mcp-shark/rule-packs)**. The npm package embeds copies; `update-rules` pulls the same artifacts into `.mcp-shark/rule-packs/`.

mcp-shark ships with 24 declarative rules as JSON packs (OWASP MCP, Agentic Security Initiative, General Security), plus a **`toxic-flow-heuristics`** pack (`toxic_flow_rules` for cross-server composition). New vulnerability catalogs can be added as `.json` files — no JavaScript, no code changes.

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

Same as the older shortcut (no `serve` subcommand):

```bash
npx @mcp-shark/mcp-shark --open
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
│  Data layer (JSON + user YAML/JSON overrides)      │
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
- **Data-first** — Declarative rules, secret patterns, tool classifications, and toxic-flow defaults ship as JSON; **24** of **35** rules are pattern packs you can extend or override without forking those definitions.
- **User-overridable** — Built-in data can be extended via `.mcp-shark/*.yaml` (and JSON pack drops) as documented above.
- **Hybrid rule engine** — The other **11** rules are JS plugins where heuristics need code. Both sources are merged at scan time.
- **Zero-config scanning** — `npx` and go. Auto-detects the IDE paths below plus project-local `mcp.json` variants.

## Documentation

- **[Rule pack registry](https://github.com/mcp-shark/rule-packs)** — Official `manifest.json` and JSON packs consumed by `update-rules`
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
  <strong>MCP servers can chain through the agent — mcp-shark surfaces risky combinations in config and traffic.</strong>
</div>
