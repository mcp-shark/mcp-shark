import {
  COMMAND_INJECTION_BENIGN_PATTERNS,
  COMMAND_INJECTION_CONTEXT_PATTERNS,
  COMMAND_INJECTION_CRITICAL_PATTERNS,
} from '../constants.js';
import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'asi05-rce';
const OWASP_ID = 'ASI05';
const RECOMMENDATION =
  'Implement strict input validation and sanitization. Prevent arbitrary code execution. Use sandboxing and isolation mechanisms.';

function compile(patterns) {
  return patterns.map((pattern) => new RegExp(pattern, 'i'));
}

const criticalRegexes = compile(COMMAND_INJECTION_CRITICAL_PATTERNS);
const contextRegexes = compile(COMMAND_INJECTION_CONTEXT_PATTERNS);
const benignRegexes = compile(COMMAND_INJECTION_BENIGN_PATTERNS);

function runRegexCollection(text, regexes) {
  const hits = [];
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match) {
      hits.push(match[0]);
    }
  }
  return hits;
}

function evaluateMatches(criticalHits, contextHits, benignHits) {
  const criticalCount = criticalHits.length;
  const contextCount = contextHits.length;
  const malicious = criticalCount + contextCount;
  const benignCount = benignHits.length;

  if (criticalCount >= 2) {
    return true;
  }
  if (criticalCount >= 1 && contextCount >= 1) {
    return true;
  }
  if (malicious >= 2 && benignCount < malicious) {
    return true;
  }
  if (malicious >= 3) {
    return true;
  }
  return false;
}

function scanEntity(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const criticalHits = runRegexCollection(text, criticalRegexes);
  const contextHits = runRegexCollection(text, contextRegexes);
  const benignHits = runRegexCollection(text, benignRegexes);

  const malicious = evaluateMatches(criticalHits, contextHits, benignHits);
  if (!malicious) {
    return null;
  }

  const snippets = [...criticalHits, ...contextHits]
    .map((hit) => hit.trim())
    .filter(Boolean)
    .slice(0, 5);

  return { matches: snippets };
}

function buildReason(entityName, snippets) {
  if (!snippets.length) {
    return `Potential unexpected code execution (RCE) in ${entityName}.`;
  }
  return `Potential unexpected code execution (RCE) in ${entityName}: ${snippets.join(', ')}`;
}

export function scanAgentic05RCE(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const scan = scanEntity(toolToText(tool));
    if (scan) {
      results.toolFindings.push({
        issueType: 'RCE Agentic',
        name: tool?.name || 'unnamed-tool',
        severity: 'critical',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, scan.matches)],
        tags: ['rce', 'code-execution'],
        agenticCategory: OWASP_ID,
        safeUseNotes:
          'Review tool for code execution vulnerabilities. Implement strict input validation and sandboxing.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const scan = scanEntity(resourceToText(resource));
    if (scan) {
      results.resourceFindings.push({
        issueType: 'RCE Agentic',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'critical',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, scan.matches),
        ],
        tags: ['rce', 'code-execution'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const scan = scanEntity(promptToText(prompt));
    if (scan) {
      results.promptFindings.push({
        issueType: 'RCE Agentic',
        name: prompt?.name || 'prompt',
        severity: 'high',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, scan.matches)],
        tags: ['rce', 'code-execution'],
        agenticCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanAgentic05RCE, RULE_ID, OWASP_ID, RECOMMENDATION);

export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;

export function analyzePacket(packet) {
  const text = packetToText(packet);
  const scan = scanEntity(text);
  if (!scan) {
    return [];
  }
  return [
    convertPacketFinding(
      {
        issueType: 'RCE Agentic',
        severity: 'critical',
        title: 'RCE Pattern in Traffic',
        description: `Potential code execution in packet: ${scan.matches.join(', ')}`,
        evidence: scan.matches[0]?.substring(0, 50) || '',
      },
      RULE_ID,
      OWASP_ID,
      RECOMMENDATION,
      packet
    ),
  ];
}

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Agentic RCE Detection',
  owasp_id: OWASP_ID,
  severity: 'critical',
  description: 'Detects unexpected code execution (RCE) vulnerabilities in agentic contexts.',
  source: 'static',
  type: 'agentic-security',
};
