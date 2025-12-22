# Tool Drift Analysis (Deterministic + Optional Local LLM)

This document explains how MCP Shark tracks **tool manifest drift** (changes in `tools/list` results over time) and optionally uses a **local LLM** to turn raw diffs into security-focused, actionable findings.

## What problem this solves

MCP servers can change their exposed tools over time (new tools, removed tools, schema changes). Those changes can introduce:

- New data exfiltration paths
- Expanded permissions/parameters
- Risky defaults or new “dangerous” capabilities
- Prompt injection exposure via new tooling surfaces

MCP Shark turns `tools/list` changes into a durable audit trail and a review workflow.

## High-level flow

1. MCP Shark logs all MCP traffic into SQLite.
2. When a successful `tools/list` **response** is observed, MCP Shark:
   - Normalizes the manifest (stable ordering, stable shape)
   - Hashes it
   - Stores a **snapshot**
   - Compares against the last snapshot for that server
   - If changed, stores a **drift record** with a deterministic diff + severity
3. If Local LLM analysis is enabled (optional), it:
   - Builds a compact prompt from baseline/current manifests + diff
   - Runs a local model via `node-llama-cpp`
   - Validates output against a strict JSON schema
   - Stores the analysis in the drift record
4. The **Tool Drifts** tab shows the drift list + detail view (including optional LLM findings).

## Deterministic drift detection (always-on)

Deterministic drift tracking is always active once MCP Shark is capturing traffic. It does **not** require an LLM.

### Trigger condition

Drift tracking is triggered when MCP Shark observes a **successful** `tools/list` response for a server.

### Normalization

Different MCP servers can return tool manifests with non-deterministic ordering or extra fields. MCP Shark normalizes manifests so comparisons are stable across runs.

Typical normalization behaviors:

- Sort tools by name
- Drop or ignore non-stable metadata when possible
- Keep security-relevant fields (name, description, input schema)

### Hashing

MCP Shark hashes the normalized manifest (SHA-256) to create a stable fingerprint.

### Diffing

When a new snapshot is created, MCP Shark computes a structured diff against the latest prior snapshot for that server:

- Added tools
- Removed tools
- Changed tools (description and/or schema changes)

It also computes a deterministic severity (`low` → `critical`) based on the diff characteristics.

### Persistence

Snapshots and drifts are persisted into the local SQLite database at:

- `~/.mcp-shark/db/mcp-shark.sqlite`

Tables:

- `tool_manifest_snapshots`
  - Per-server normalized manifest snapshots (deduplicated by `(server_key, manifest_hash)`).
- `tool_manifest_drifts`
  - Drift records, including deterministic diff summary and optional LLM analysis fields.

## Optional Local LLM analysis

Local LLM analysis is **disabled by default** and is designed to be safe and predictable.

### When it runs

Local LLM analysis runs only when both are true:

- `enabled: true` in LLM settings
- You manually run “Test load model” (for validation), and/or you enable “Auto-run on drift” to analyze each new drift

### What it does

For a drift record, MCP Shark prepares a compact prompt containing:

- A compact representation of the baseline tool manifest
- A compact representation of the current tool manifest
- A compact diff summary

It then asks the model for a **strict JSON response** describing:

- Overall risk level
- Short summary
- Up to ~20 findings (per-tool findings with severity + recommendations)
- Optional confidence

### Output validation (important)

LLM output is validated with Zod against a strict schema. If the model returns invalid JSON (or extra text), MCP Shark will attempt to extract JSON and retry a small number of times.

If analysis fails, the drift record still exists and remains viewable (you’ll see the error field instead of findings).

## Guardrails & resource controls

To reduce “my laptop just melted” scenarios, MCP Shark includes:

- **Disabled by default**
- **RAM threshold** (`minRamGb`) to prevent accidental model loads on low-memory systems
- **Cooldown** between test loads (`cooldownMs`)
- Model load testing runs in a **subprocess** to avoid permanently consuming memory in the UI server process
- User-configurable performance caps (threads, context tokens, output tokens)

## UI: where to use it

### Tool Drifts tab

The **Tool Drifts** tab shows:

- A list of drift records (server key, deterministic severity, timestamp, summary)
- A detail panel for a selected drift:
  - Deterministic change breakdown (added/removed/changed tools)
  - Optional LLM risk summary + per-tool findings
  - Metadata (hashes, model info, prompt version, timestamps)

### MCP Server Setup → Local LLM Drift Analysis (optional)

This section manages local LLM configuration:

- Enable/disable Local LLM analysis
- Toggle auto-analysis on drift
- Select a model (auto-recommended or manual)
- Configure resource caps
- Interactive setup actions:
  - Install `node-llama-cpp` dependencies (runs `npm install` locally)
  - Download GGUF model files into `~/.mcp-shark/models` (progress + cancel)

## API endpoints

See:

- `docs/api-reference.md` for the complete API details

Key endpoints:

- **Tool drift records**
  - `GET /api/drifts`
  - `GET /api/drifts/:driftId`
- **LLM settings & setup**
  - `GET /api/settings`
  - `POST /api/settings/llm`
  - `POST /api/settings/llm/test`
  - `GET /api/llm/catalog`
  - `POST /api/llm/download`
  - `GET /api/llm/download/status`
  - `POST /api/llm/download/cancel`
  - `POST /api/llm/deps/install`
  - `GET /api/llm/deps/status`
  - `POST /api/llm/deps/cancel`

## Troubleshooting

### “No tool drifts detected yet”

- Make sure MCP Shark is running and your IDE is routed through it.
- Trigger at least one `tools/list` (open the playground Tools list, or let your IDE request it).
- Ensure the server is returning successful `tools/list` responses (2xx).

### “Test load model” returns 400

Common causes:

- LLM is disabled (enable it first)
- `node-llama-cpp` is not installed (use the installer in the UI or install manually)
- Your machine RAM is below `minRamGb`

### Model download 404 / blocked downloads

Some hosting providers (notably Hugging Face) can return 404/403 for non-browser clients depending on URL format and WAF rules.

Try:

- Ensure your URL uses `/resolve/main/...` (not `/blob/main/...`)
- Use the model catalog entry (it’s formatted for direct download)
- If a host still blocks downloads, download the `.gguf` in your browser and place it in:
  - `~/.mcp-shark/models`



