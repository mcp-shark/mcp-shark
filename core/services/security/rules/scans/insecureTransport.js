/**
 * Insecure Transport Detection
 * Detects MCP servers using HTTP instead of HTTPS, or SSE/WebSocket
 * connections without TLS, exposing traffic to interception.
 * Catalog reference: §1.7
 */
import { createRuleAdapter } from '../utils/adapter.js';
import { toolToText } from '../utils/text.js';

const RULE_ID = 'insecure-transport';
const OWASP_ID = 'MCP07';
const RECOMMENDATION =
  'Use HTTPS/WSS for all remote MCP server connections. localhost HTTP is acceptable for local-only servers.';

const HTTP_URL_IN_TEXT = /http:\/\/[^\s'"<>]+/gi;
const WS_URL_IN_TEXT = /ws:\/\/[^\s'"<>]+/gi;

/**
 * True when URL host is loopback / local bind only (exact host match, not localhost.evil.com).
 */
function isLocalhostUrl(urlString) {
  try {
    const u = new URL(urlString);
    const h = u.hostname.toLowerCase();
    return (
      h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '[::1]' || h === '::1'
    );
  } catch {
    return false;
  }
}

function textHasNonLocalHttp(text) {
  for (const m of text.matchAll(HTTP_URL_IN_TEXT)) {
    if (!isLocalhostUrl(m[0])) {
      return true;
    }
  }
  return false;
}

function textHasNonLocalWs(text) {
  for (const m of text.matchAll(WS_URL_IN_TEXT)) {
    if (!isLocalhostUrl(m[0])) {
      return true;
    }
  }
  return false;
}

export function scanInsecureTransport(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const text = toolToText(tool);

    if (textHasNonLocalHttp(text)) {
      results.toolFindings.push({
        issueType: 'Insecure Transport (HTTP)',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [
          `Tool "${tool?.name || 'unknown'}" references a non-localhost HTTP URL. Traffic can be intercepted.`,
        ],
        tags: ['transport', 'tls'],
        safeUseNotes: RECOMMENDATION,
      });
    }

    if (textHasNonLocalWs(text)) {
      results.toolFindings.push({
        issueType: 'Insecure Transport (WebSocket)',
        name: tool?.name || 'tool',
        severity: 'medium',
        reasons: [
          `Tool "${tool?.name || 'unknown'}" references a non-localhost WS URL. Traffic can be intercepted.`,
        ],
        tags: ['transport', 'websocket'],
        safeUseNotes: RECOMMENDATION,
      });
    }
  }

  return results;
}

/**
 * Analyze a server config for insecure transport
 * Called directly by ScanService
 */
export function analyzeServerTransport(serverName, config) {
  if (!config?.url) {
    return [];
  }

  const findings = [];
  const urlStr = config.url;

  if (urlStr.startsWith('http://') && !isLocalhostUrl(urlStr)) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'high',
      owasp_id: OWASP_ID,
      title: `Insecure transport: ${serverName} uses HTTP`,
      description: `${serverName} connects to ${config.url} over plain HTTP. Credentials and data are transmitted in cleartext.`,
      recommendation: RECOMMENDATION,
      server_name: serverName,
      confidence: 'definite',
    });
  }

  if (urlStr.startsWith('ws://') && !isLocalhostUrl(urlStr)) {
    findings.push({
      rule_id: RULE_ID,
      severity: 'high',
      owasp_id: OWASP_ID,
      title: `Insecure transport: ${serverName} uses WS`,
      description: `${serverName} connects to ${config.url} over plain WebSocket. Upgrade to WSS.`,
      recommendation: RECOMMENDATION,
      server_name: serverName,
      confidence: 'definite',
    });
  }

  return findings;
}

const adapter = createRuleAdapter(scanInsecureTransport, RULE_ID, OWASP_ID, RECOMMENDATION);
export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;
export const analyzePacket = adapter.analyzePacket;

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Insecure Transport',
  owasp_id: OWASP_ID,
  severity: 'medium',
  description: 'Detects non-localhost HTTP/WS connections that expose traffic to interception.',
  source: 'static',
  type: 'general-security',
};
