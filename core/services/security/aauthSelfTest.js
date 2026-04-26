/**
 * AAuth self-test traffic synthesizer.
 *
 * Generates realistic AAuth-shaped HTTP packets and writes them through
 * mcp-shark's normal audit path (AuditService.logRequestPacket /
 * logResponsePacket) so they look identical to live captured traffic.
 *
 * Strict scope:
 *   - Pure observability fixture. No real outbound network calls.
 *   - No cryptographic signing. The Signature/Signature-Input bytes are
 *     placeholders meant to be visually inspected, not validated.
 *   - The point is to populate the Traffic, Posture, and Explorer views so
 *     a developer can see how AAuth signals are surfaced even before any
 *     production agent integration is in place.
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const KNOWN_AGENTS = [
  { id: 'aauth:demo-agent@example.dev', alg: 'ed25519', keyid: 'demo-key-1' },
  { id: 'aauth:read-only-agent@example.dev', alg: 'ecdsa-p256-sha256', keyid: 'read-key-1' },
  { id: 'aauth:writer-agent@example.dev', alg: 'ed25519', keyid: 'writer-key-1' },
];

const KNOWN_MISSIONS = [
  'mission:lookup-customer-record',
  'mission:summarize-incident-2026-04',
  'mission:reset-staging-database',
];

const KNOWN_TOOLS = ['lookup_record', 'summarize_incident', 'protected_query', 'echo'];

const ACCESS_MODES = [
  { mode: 'ps-managed', resource: 'https://api.example.com/records' },
  { mode: 'identity-based', resource: 'https://api.example.com/profiles' },
  { mode: 'federated', resource: 'https://api.partner.example.com/exchange' },
];

const PLACEHOLDER_SIG =
  'sig1=:MEUCIQDxPLACEHOLDER0000000000000000000000000000000000000000AAAAAAA=:';
const PLACEHOLDER_KEY_THUMBPRINT = 'sha-256=:AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AAAAAAAA=:';

function pick(list, i) {
  return list[i % list.length];
}

function buildSignatureInput(agent) {
  const created = Math.floor(Date.now() / 1000);
  return `sig1=("@method" "@target-uri" "host" "content-digest");keyid="${agent.keyid}";alg="${agent.alg}";created=${created}`;
}

function buildJsonRpcRequest(id, toolName, missionId) {
  return {
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: { mission: missionId, ts: new Date().toISOString() },
    },
  };
}

function buildJsonRpcResponse(id, toolName) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      content: [{ type: 'text', text: `synthetic ${toolName} response` }],
    },
  };
}

function readMcpsConfigSafely() {
  try {
    const p = join(homedir(), '.mcp-shark', 'mcps.json');
    const raw = readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.servers === 'object' ? parsed.servers : {};
  } catch {
    return {};
  }
}

/**
 * Auto-detect HTTP MCP upstreams from ~/.mcp-shark/mcps.json. We don't actually
 * call them — we use the names/URLs to make synthetic packets feel grounded
 * to the developer ("oh, that's the upstream I configured").
 */
export function detectHttpUpstreams() {
  const servers = readMcpsConfigSafely();
  const detected = [];
  for (const [name, def] of Object.entries(servers)) {
    if (!def || typeof def !== 'object') {
      continue;
    }
    if (def.type === 'http' && typeof def.url === 'string') {
      detected.push({ name, url: def.url });
    }
  }
  return detected;
}

const SCENARIOS = [
  {
    id: 'signed',
    label: 'Signed AAuth call',
    posture: 'signed',
    buildHeaders(ctx) {
      return {
        host: ctx.host,
        'content-type': 'application/json',
        'user-agent': 'mcp-shark-self-test/1.0',
        signature: PLACEHOLDER_SIG,
        'signature-input': buildSignatureInput(ctx.agent),
        'signature-key': PLACEHOLDER_KEY_THUMBPRINT,
        'aauth-agent': ctx.agent.id,
        'aauth-mission': ctx.mission,
      };
    },
    buildResponseHeaders(ctx) {
      return {
        'content-type': 'application/json',
        signature: PLACEHOLDER_SIG,
        'signature-input': buildSignatureInput(ctx.agent),
        'signature-key': PLACEHOLDER_KEY_THUMBPRINT,
        'aauth-agent': ctx.agent.id,
        'aauth-mission': ctx.mission,
      };
    },
    statusCode: 200,
  },
  {
    id: 'challenge',
    label: 'AAuth challenge (401)',
    posture: 'none-then-aware',
    buildHeaders(ctx) {
      return {
        host: ctx.host,
        'content-type': 'application/json',
        'user-agent': 'mcp-shark-self-test/1.0',
      };
    },
    buildResponseHeaders(ctx) {
      const access = ctx.access;
      return {
        'content-type': 'application/json',
        'aauth-requirement': `mode="${access.mode}"; resource="${access.resource}"; jwks_uri="https://example.com/.well-known/aauth/jwks.json"`,
        'www-authenticate': `AAuth realm="example", mode="${access.mode}", resource="${access.resource}"`,
      };
    },
    statusCode: 401,
  },
  {
    id: 'bearer',
    label: 'Bearer token call',
    posture: 'bearer',
    buildHeaders(ctx) {
      return {
        host: ctx.host,
        'content-type': 'application/json',
        'user-agent': 'mcp-shark-self-test/1.0',
        authorization: 'Bearer demo-token-must-be-rotated-9c4f2a',
      };
    },
    buildResponseHeaders() {
      return {
        'content-type': 'application/json',
        'www-authenticate': 'Bearer realm="example"',
      };
    },
    statusCode: 200,
  },
  {
    id: 'bearer-coexist',
    label: 'Bearer + AAuth (drift smell)',
    posture: 'bearer',
    buildHeaders(ctx) {
      return {
        host: ctx.host,
        'content-type': 'application/json',
        'user-agent': 'mcp-shark-self-test/1.0',
        authorization: 'Bearer legacy-token-rotation-required',
        'signature-input': buildSignatureInput(ctx.agent),
        signature: PLACEHOLDER_SIG,
        'aauth-agent': ctx.agent.id,
      };
    },
    buildResponseHeaders() {
      return { 'content-type': 'application/json' };
    },
    statusCode: 200,
  },
];

/**
 * Run a single self-test pass. Synthesizes scenario-driven JSON-RPC traffic
 * for each detected upstream (or a default placeholder triple if none are
 * configured) and writes both request and response packets via the audit
 * service so they appear as normal captured traffic.
 *
 * @param {object} deps
 * @param {object} deps.auditService - mcp-shark AuditService
 * @param {object} deps.logger - pino-style logger
 * @param {object} [opts]
 * @param {number} [opts.rounds=2] - how many rounds (each round runs every scenario once per upstream)
 * @returns {{
 *   rounds: number,
 *   targets: Array<{name:string,url:string}>,
 *   inserted: number,
 *   by_scenario: Record<string, number>,
 *   by_posture: Record<string, number>,
 *   started_at_iso: string,
 *   finished_at_iso: string,
 * }}
 */
export function runAauthSelfTest({ auditService, logger }, opts = {}) {
  const rounds = Math.max(1, Math.min(10, Number(opts.rounds) || 2));
  const startedAt = new Date();

  let upstreams = detectHttpUpstreams();
  if (upstreams.length === 0) {
    upstreams = [
      { name: 'aauth-signed', url: 'http://127.0.0.1:9701/mcp' },
      { name: 'aauth-challenge', url: 'http://127.0.0.1:9702/mcp' },
      { name: 'aauth-bearer', url: 'http://127.0.0.1:9703/mcp' },
    ];
  }

  let inserted = 0;
  const byScenario = {};
  const byPosture = {};
  let nextJsonRpcId = Date.now();

  for (let round = 0; round < rounds; round++) {
    for (let u = 0; u < upstreams.length; u++) {
      const upstream = upstreams[u];
      const url = upstream.url;
      let host;
      try {
        host = new URL(url).host;
      } catch {
        host = `${upstream.name}.local`;
      }

      const upstreamScenarios = chooseScenariosForUpstream(upstream.name);

      for (const scenario of upstreamScenarios) {
        const agent = pick(KNOWN_AGENTS, round + u);
        const mission = pick(KNOWN_MISSIONS, round + u + scenario.id.length);
        const access = pick(ACCESS_MODES, round + u);
        const tool = pick(KNOWN_TOOLS, round + u);
        const ctx = { agent, mission, access, host, upstream };

        const jsonrpcId = `self-test-${nextJsonRpcId++}`;
        const reqBody = buildJsonRpcRequest(jsonrpcId, tool, mission);
        const reqHeaders = scenario.buildHeaders(ctx);

        try {
          auditService.logRequestPacket({
            method: 'POST',
            url,
            headers: reqHeaders,
            body: reqBody,
            userAgent: reqHeaders['user-agent'] || 'mcp-shark-self-test/1.0',
            remoteAddress: '127.0.0.1',
          });
        } catch (err) {
          logger?.warn?.(
            { error: err.message, scenario: scenario.id },
            'self-test request log failed'
          );
          continue;
        }

        const respBody =
          scenario.statusCode === 401
            ? {
                jsonrpc: '2.0',
                id: jsonrpcId,
                error: { code: -32001, message: 'AAuth signature required' },
              }
            : buildJsonRpcResponse(jsonrpcId, tool);
        const respHeaders = scenario.buildResponseHeaders(ctx);
        respHeaders.host = host;

        try {
          auditService.logResponsePacket({
            statusCode: scenario.statusCode,
            headers: respHeaders,
            body: respBody,
            jsonrpcId,
            userAgent: reqHeaders['user-agent'] || 'mcp-shark-self-test/1.0',
            remoteAddress: '127.0.0.1',
          });
        } catch (err) {
          logger?.warn?.(
            { error: err.message, scenario: scenario.id },
            'self-test response log failed'
          );
          continue;
        }

        inserted += 2;
        byScenario[scenario.id] = (byScenario[scenario.id] || 0) + 1;
        byPosture[scenario.posture] = (byPosture[scenario.posture] || 0) + 1;
      }
    }
  }

  const finishedAt = new Date();
  return {
    rounds,
    targets: upstreams,
    inserted,
    by_scenario: byScenario,
    by_posture: byPosture,
    started_at_iso: startedAt.toISOString(),
    finished_at_iso: finishedAt.toISOString(),
  };
}

/**
 * Pick the scenarios that match an upstream's apparent role. Server names
 * containing well-known substrings get tailored scenarios so the resulting
 * graph is intuitive (signed-server → signed scenario). Anything else gets
 * the full mix.
 */
function chooseScenariosForUpstream(name) {
  const lc = (name || '').toLowerCase();
  if (lc.includes('signed')) {
    return SCENARIOS.filter((s) => s.id === 'signed');
  }
  if (lc.includes('challenge')) {
    return SCENARIOS.filter((s) => s.id === 'challenge');
  }
  if (lc.includes('bearer') && lc.includes('coexist')) {
    return SCENARIOS.filter((s) => s.id === 'bearer-coexist');
  }
  if (lc.includes('bearer')) {
    return SCENARIOS.filter((s) => s.id === 'bearer');
  }
  return SCENARIOS;
}
