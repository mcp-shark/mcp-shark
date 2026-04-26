/**
 * AAuth Visibility Parser
 *
 * Pure, observer-only parser for AAuth artifacts as they appear in HTTP
 * headers and (incidentally) MCP server config. Does NOT perform any
 * cryptographic verification — every signal it returns is described as
 * "observed" or "present", never "valid".
 *
 * Specs informally referenced:
 *   - HTTP Message Signatures (RFC 9421)        — Signature, Signature-Input
 *   - draft-hardt-http-signature-keys (AAuth)   — Signature-Key, Signature-Error
 *   - draft-hardt-aauth-protocol                — AAuth-Agent, AAuth-Mission,
 *                                                  AAuth-Requirement
 *
 * The parser is intentionally liberal in what it accepts: AAuth drafts evolve,
 * and visibility-only is the right place to record what is on the wire.
 */

const AAUTH_AGENT_ID_REGEX = /aauth:[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SIGNATURE_HEADER_NAMES = ['signature', 'signature-input'];
const AAUTH_HEADER_PREFIX = 'aauth-';

/**
 * Lower-case all header keys, returning a new object.
 * Tolerates non-object input by returning {}.
 */
function normalizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return {};
  }
  const out = {};
  for (const key of Object.keys(headers)) {
    out[key.toLowerCase()] = headers[key];
  }
  return out;
}

/**
 * Parse a Signature-Input value into its first label's covered components and
 * algorithm parameter. Format example:
 *   sig1=("@method" "@target-uri" "host");keyid="abc";alg="ed25519";created=1700000000
 *
 * Returns { label, covered, alg, keyid, created } or null on failure.
 */
function parseSignatureInput(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const labelMatch = value.match(/^\s*([A-Za-z0-9_-]+)\s*=\s*\(([^)]*)\)(.*)$/);
  if (!labelMatch) {
    return null;
  }
  const [, label, componentsRaw, paramsRaw] = labelMatch;
  const covered = [];
  const componentRegex = /"([^"]+)"/g;
  let m = componentRegex.exec(componentsRaw);
  while (m) {
    covered.push(m[1]);
    m = componentRegex.exec(componentsRaw);
  }

  const params = {};
  const paramRegex = /;\s*([A-Za-z0-9_-]+)=("([^"]*)"|([0-9]+))/g;
  let pm = paramRegex.exec(paramsRaw);
  while (pm) {
    const [, key, , quoted, raw] = pm;
    params[key] = quoted !== undefined ? quoted : raw;
    pm = paramRegex.exec(paramsRaw);
  }

  return {
    label,
    covered,
    alg: params.alg || null,
    keyid: params.keyid || null,
    created: params.created ? Number(params.created) : null,
  };
}

/**
 * Truncate a key/thumbprint string to a UI-friendly preview while keeping
 * enough characters to be visually distinguishable.
 */
function shortFingerprint(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.replace(/^"|"$/g, '').trim();
  if (trimmed.length <= 16) {
    return trimmed;
  }
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}

/**
 * Extract any AAuth agent identifier(s) from a string. Returns the first match
 * or null. Matches the form `aauth:<local>@<domain>` from the AAuth draft.
 */
export function extractAgentId(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  AAUTH_AGENT_ID_REGEX.lastIndex = 0;
  const m = text.match(AAUTH_AGENT_ID_REGEX);
  return m ? m[0] : null;
}

/**
 * Parse AAuth signals from a single packet's headers.
 *
 * Returns a normalized envelope. Every field is purely observational; the
 * caller MUST NOT treat any of these values as cryptographically validated.
 *
 * @param {object|string|null|undefined} headers
 * @returns {{
 *   posture: 'signed' | 'aauth-aware' | 'bearer' | 'none',
 *   sig_present: boolean,
 *   sig_alg: string | null,
 *   sig_keyid: string | null,
 *   sig_keyid_short: string | null,
 *   sig_covered: string[],
 *   key_thumbprint: string | null,
 *   key_thumbprint_short: string | null,
 *   agent: string | null,
 *   mission: string | null,
 *   requirement: string | null,
 *   error: string | null,
 *   raw: Record<string, string>
 * }}
 */
export function parseAauthHeaders(headers) {
  const h = normalizeHeaders(headers);

  const sigInputRaw = h['signature-input'] || null;
  const sigRaw = h.signature || null;
  const sigKeyRaw = h['signature-key'] || null;
  const sigErrorRaw = h['signature-error'] || null;
  const agentRaw = h['aauth-agent'] || null;
  const missionRaw = h['aauth-mission'] || null;
  const requirementRaw = h['aauth-requirement'] || h['www-authenticate-aauth'] || null;
  const authzRaw = h.authorization || null;

  const parsedInput = parseSignatureInput(sigInputRaw);

  const sigPresent = Boolean(sigRaw && sigInputRaw);
  const sigAlg = parsedInput?.alg || null;
  const sigKeyid = parsedInput?.keyid || null;
  const sigCovered = parsedInput?.covered || [];

  const agent = agentRaw || extractAgentId(authzRaw) || extractAgentId(sigKeyRaw) || null;

  const aauthHeaderNames = Object.keys(h).filter((k) => k.startsWith(AAUTH_HEADER_PREFIX));
  const aauthAware = aauthHeaderNames.length > 0 || Boolean(sigKeyRaw);

  let posture;
  if (sigPresent) {
    posture = 'signed';
  } else if (aauthAware) {
    posture = 'aauth-aware';
  } else if (authzRaw && /^bearer\s/i.test(authzRaw)) {
    posture = 'bearer';
  } else {
    posture = 'none';
  }

  const raw = {};
  for (const name of [
    ...SIGNATURE_HEADER_NAMES,
    'signature-key',
    'signature-error',
    'aauth-agent',
    'aauth-mission',
    'aauth-requirement',
  ]) {
    if (h[name]) {
      raw[name] = h[name];
    }
  }

  return {
    posture,
    sig_present: sigPresent,
    sig_alg: sigAlg,
    sig_keyid: sigKeyid,
    sig_keyid_short: shortFingerprint(sigKeyid),
    sig_covered: sigCovered,
    key_thumbprint: sigKeyRaw,
    key_thumbprint_short: shortFingerprint(sigKeyRaw),
    agent,
    mission: missionRaw,
    requirement: requirementRaw,
    error: sigErrorRaw,
    raw,
  };
}

/**
 * Parse AAuth signals from a packet record (shape returned by PacketRepository).
 * Reads `headers_json` (string or object).
 */
export function parseAauthForPacket(packet) {
  if (!packet) {
    return parseAauthHeaders(null);
  }
  let headers = packet.headers_json || packet.headers;
  if (typeof headers === 'string') {
    try {
      headers = JSON.parse(headers);
    } catch {
      headers = {};
    }
  }
  return parseAauthHeaders(headers);
}

/**
 * Summarize AAuth posture across a list of packets. Useful for the inventory
 * panel and CLI summary line.
 *
 * Returns counts by posture and the set of unique agents/missions observed.
 */
export function summarizeAauth(packets) {
  const counts = { signed: 0, 'aauth-aware': 0, bearer: 0, none: 0 };
  const agents = new Set();
  const missions = new Set();
  let total = 0;

  for (const packet of packets || []) {
    const aauth = parseAauthForPacket(packet);
    counts[aauth.posture] = (counts[aauth.posture] || 0) + 1;
    total += 1;
    if (aauth.agent) {
      agents.add(aauth.agent);
    }
    if (aauth.mission) {
      missions.add(aauth.mission);
    }
  }

  return {
    total,
    counts,
    unique_agents: [...agents],
    unique_missions: [...missions],
  };
}

/**
 * Decide whether a config-level server entry advertises AAuth in any way we
 * can recognize without a network call. This is intentionally narrow: presence
 * of an `aauth_id`, a JWKS URL, or a `.well-known/aauth` URL.
 *
 * Returns null if no signal, otherwise an object describing what we saw.
 */
export function inspectServerConfigForAauth(serverConfig) {
  if (!serverConfig || typeof serverConfig !== 'object') {
    return null;
  }
  const blob = JSON.stringify(serverConfig);
  const aauthId = extractAgentId(blob);
  const wellKnown = blob.match(/https?:\/\/[^"'\s]+\/\.well-known\/aauth[^"'\s]*/);
  const jwksUrl = blob.match(/https?:\/\/[^"'\s]+\/jwks(?:\.json)?[^"'\s]*/i);

  if (!aauthId && !wellKnown && !jwksUrl) {
    return null;
  }

  return {
    agent: aauthId || null,
    well_known_url: wellKnown ? wellKnown[0] : null,
    jwks_url: jwksUrl ? jwksUrl[0] : null,
  };
}
