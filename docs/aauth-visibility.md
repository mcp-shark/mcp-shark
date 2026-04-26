# AAuth Visibility

mcp-shark observes [AAuth](https://www.aauth.dev) signals (RFC 9421 HTTP Message Signatures, AAuth identity headers, AAuth missions, JWKS endpoints, `.well-known/aauth` URLs) and surfaces them in the UI, the CLI, and the security findings panel.

> **Visibility-only.** mcp-shark records these signals as observed. It does not verify signatures, does not store private keys, does not modify traffic, and does not enforce policy. Cryptographic verification is the job of an AAuth-capable client or resource server.

## What you get

- An **AAuth Explorer tab** with a force-directed knowledge graph of every Agent / Mission / Resource / Signing algorithm / Access mode observed across captured traffic; click any node to drill into the underlying packets and pivot to the Traffic tab. Inspired by [mcp-shark.github.io/aauth-explorer](https://mcp-shark.github.io/aauth-explorer/) — but every node here is grounded in observed packets, not a static figure
- An **AAuth posture chip** on every captured packet (Signed · AAuth-aware · Bearer · No auth)
- An **Identity panel** in the packet detail view with the agent ID, mission, signature algorithm, key thumbprint preview and covered components — every value labelled `observed`
- **Filter chips** for posture, agent, and mission in the traffic toolbar
- An **AAuth Posture** card on the Local Analysis tab that summarizes posture across captured traffic, with a **Generate sample data** button that inserts a representative *fake* AAuth traffic sample (tagged `user-agent: mcp-shark-self-test/1.0`) so you can preview the views without any AAuth-aware MCP in your stack — no external services required, no signatures verified
- An **`aauth-visibility`** declarative rule pack (six low-severity informational rules) that surfaces AAuth artefacts found during static scans
- An **AAuth Visibility** line in `mcp-shark list` that counts how many configured servers advertise AAuth (agent ID, JWKS, or `.well-known/aauth`)
- **REST API:**
  - `GET /api/aauth/posture` – summary of posture counts, unique agents, unique missions
  - `GET /api/aauth/missions` – mission timeline grouping (frame range, packet count, agents and servers involved)
  - `GET /api/aauth/graph` – nodes + edges + categories ready for a force-layout
  - `GET /api/aauth/upstreams` – HTTP MCP upstreams currently configured for mcp-shark (used by the self-check button)
  - `GET /api/aauth/node/:category/:id` – packets backing a single graph node
  - `POST /api/aauth/self-test` – insert *fake* AAuth packets for demo / preview purposes; tagged `user-agent: mcp-shark-self-test/1.0`. Body: `{rounds?: number}`

## Architecture

```
HTTP packet ──► AuditService ──► PacketRepository (DB)
                                           │
                                           ▼
                                  RequestService.getRequests()
                                  ── enrichWithAauth() ──► aauthParser.parseAauthHeaders()
                                           │
                                           ▼
                                       JSON response: {…packet, aauth: {…}}
                                           │
                          ┌────────────────┼────────────────────┐
                          ▼                ▼                    ▼
                   RequestRow chip   Identity panel      Posture summary
```

- **No DB migration.** The parser runs at read-time on `headers_json`. Existing capture data lights up automatically.
- **No crypto, no network.** The parser is a pure function over header strings.
- **No private key storage.** Only the `Signature-Key` value (a thumbprint or public-key hint) is shown, and only as a truncated preview.

## Posture vocabulary

| Posture | Meaning |
| --- | --- |
| `signed` | Both `Signature` and `Signature-Input` headers were observed. Signature is *not* verified. |
| `aauth-aware` | One or more `AAuth-*` headers, or a `Signature-Key`, were observed without a complete signature. |
| `bearer` | An `Authorization: Bearer …` was observed and no AAuth signal was present. |
| `none` | None of the above. |

## Rule pack

`core/cli/data/rule-packs/aauth-visibility.json` ships the following informational rules:

| Rule ID | Where it fires |
| --- | --- |
| `aauth-agent-identity-observed` | Any tool/prompt/resource/packet text matching `aauth:<local>@<domain>` |
| `aauth-jwks-discovery-url` | URLs containing `/.well-known/aauth` or `/jwks` |
| `aauth-http-message-signature-observed` | `Signature-Input` or `Signature` headers in captured packets |
| `aauth-mission-context-observed` | `AAuth-Mission` headers in captured packets |
| `aauth-requirement-challenge-observed` | `AAuth-Requirement` response headers (resource asking for AAuth) |
| `aauth-bearer-token-coexists-with-aauth` | Same packet has both a Bearer token *and* an AAuth signature — flagged `medium` because this is the worst-of-both-worlds pattern called out by the AAuth project |

Override or extend these rules with `.mcp-shark/rule-packs/*.json` — same JSON format, no JavaScript needed.

## API examples

```bash
# Summary across all captured traffic
curl http://localhost:9853/api/aauth/posture
# {
#   "observed": true,
#   "verified": false,
#   "total_packets": 124,
#   "counts": { "signed": 96, "aauth-aware": 4, "bearer": 16, "none": 8 },
#   "signed_ratio": 0.774,
#   "unique_agents": ["aauth:cursor-instance-7@hellocoop.dev"],
#   "unique_missions": ["m_2026-04-26_a"],
#   "note": "mcp-shark records AAuth signals as observed only…"
# }

# Filter requests by posture
curl 'http://localhost:9853/api/requests?aauthPosture=signed'

# Filter requests by mission
curl 'http://localhost:9853/api/requests?aauthMission=m_2026-04-26_a'
```

## What it deliberately does not do

- **No signature verification.** mcp-shark never claims a request is "valid" — it only says "signed (not verified)".
- **No JWKS fetching.** We do not make outbound calls to `.well-known/aauth` or JWKS endpoints during scan or capture. The rule pack flags references it sees in static config; the parser flags headers it sees in captured traffic.
- **No private key handling.** mcp-shark does not generate, sign with, or store any AAuth keypair.
- **No enforcement.** mcp-shark does not block or rewrite traffic based on AAuth posture. Filtering is a UI concern only.

This is a deliberate scoping decision so that AAuth observability adds value without taking on cryptographic responsibility.

## Testing against synthetic traffic

The `hellocoop/AAuth` reference client publishes example signed requests. Pointing your IDE's MCP traffic through mcp-shark while exercising that client should yield captures that light up the **Signed** posture chip, populate the Identity panel, and produce informational findings under the `aauth-visibility` rule pack.
