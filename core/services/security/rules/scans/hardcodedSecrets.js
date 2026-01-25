import { SECRET_PATTERNS } from '../constants.js';
import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'hardcoded-secrets';
const OWASP_ID = 'SECRET';
const RECOMMENDATION =
  'Move secrets or API tokens to secure storage; never embed them directly in tool or resource metadata.';

function redacted(value) {
  if (!value) {
    return '';
  }
  if (value.length <= 8) {
    return '***';
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function scanText(text) {
  if (!text) {
    return null;
  }
  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const match = text.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        sample: redacted(match[0]),
      };
    }
  }
  return null;
}

function buildReason(entity, secretInfo) {
  return `Potential ${secretInfo.type} secret leaked inside ${entity} (sample ${secretInfo.sample}).`;
}

export function scanHardcodedSecrets(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    const info = scanText(toolToText(tool));
    if (info) {
      results.toolFindings.push({
        issueType: 'Hardcoded Secret',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, info)],
        tags: ['secret'],
        safeUseNotes: 'Remove the leaked credential and rotate it immediately.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const info = scanText(resourceToText(resource));
    if (info) {
      results.resourceFindings.push({
        issueType: 'Hardcoded Secret',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, info)],
        tags: ['secret'],
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const info = scanText(promptToText(prompt));
    if (info) {
      results.promptFindings.push({
        issueType: 'Hardcoded Secret',
        name: prompt?.name || 'prompt',
        severity: 'medium',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, info)],
        tags: ['secret'],
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanHardcodedSecrets, RULE_ID, OWASP_ID, RECOMMENDATION);

export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;

export function analyzePacket(packet) {
  const text = packetToText(packet);
  const info = scanText(text);
  if (!info) {
    return [];
  }
  return [
    convertPacketFinding(
      {
        issueType: 'Hardcoded Secret',
        severity: 'high',
        title: 'Secret Detected in Traffic',
        description: `Potential ${info.type} secret in packet (sample ${info.sample}).`,
        evidence: info.sample,
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
  name: 'Hardcoded Secrets Detection',
  owasp_id: OWASP_ID,
  severity: 'high',
  description: 'Detects hardcoded secrets and API tokens in metadata.',
  source: 'static',
  type: 'general-security',
};
