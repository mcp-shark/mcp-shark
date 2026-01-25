import { convertPacketFinding, createRuleAdapter } from '../utils/adapter.js';
import { packetToText, promptToText, resourceToText, toolToText } from '../utils/text.js';

const RULE_ID = 'mcp06-prompt-injection';
const OWASP_ID = 'MCP06';
const RECOMMENDATION =
  'Implement prompt injection defenses. Validate and sanitize all user inputs. Use prompt isolation and output filtering.';

const PROMPT_INJECTION_PATTERNS = [
  /(?:ignore|forget|disregard)\s+(?:\w+\s+)*(?:previous|prior|earlier|above|instructions|prompts|system)/i,
  /(?:new|different|override|replace)\s+(?:instructions|prompt|system|rules)/i,
  /(?:you\s+are|act\s+as|pretend\s+to\s+be|roleplay\s+as)/i,
  /(?:system|admin|root|sudo)\s+(?:access|privilege|permission|command)/i,
  /(?:extract|reveal|show|display|output)\s+(?:system|prompt|instruction|secret|password|token)/i,
  /(?:execute|run|perform)\s+(?:arbitrary|any|unrestricted|unlimited)\s+(?:command|action|code)/i,
];

const SUSPICIOUS_TOOL_NAME_PATTERNS = [
  { pattern: /instruction_?override/i, name: 'Instruction Override Tool', severity: 'critical' },
  {
    pattern: /system_?prompt|systemprompt/i,
    name: 'System Prompt Access Tool',
    severity: 'critical',
  },
  { pattern: /ignore_?instruction/i, name: 'Ignore Instruction Tool', severity: 'critical' },
  { pattern: /bypass_?security/i, name: 'Security Bypass Tool', severity: 'critical' },
  { pattern: /admin_?override/i, name: 'Admin Override Tool', severity: 'critical' },
  { pattern: /privilege_?escalat/i, name: 'Privilege Escalation Tool', severity: 'high' },
  { pattern: /sudo|root_?access/i, name: 'Elevated Privilege Tool', severity: 'high' },
  { pattern: /hidden_?command/i, name: 'Hidden Command Tool', severity: 'high' },
  { pattern: /secret_?access/i, name: 'Secret Access Tool', severity: 'high' },
];

function scanText(text) {
  if (!text) {
    return null;
  }
  const matches = [];
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(match[0]);
    }
  }
  return matches.length > 0 ? matches : null;
}

function checkToolName(toolName) {
  if (!toolName) {
    return null;
  }
  for (const { pattern, name, severity } of SUSPICIOUS_TOOL_NAME_PATTERNS) {
    if (pattern.test(toolName)) {
      return { name, severity, match: toolName };
    }
  }
  return null;
}

function buildReason(entity, matches) {
  return `Potential prompt injection via contextual payloads in ${entity}: ${matches.join(', ')}`;
}

export function scanMCP06PromptInjection(mcpData = {}) {
  const results = {
    toolFindings: [],
    resourceFindings: [],
    promptFindings: [],
    notablePatterns: [],
    recommendations: [RECOMMENDATION],
  };

  for (const tool of mcpData.tools || []) {
    // Check tool name for suspicious patterns
    const nameCheck = checkToolName(tool?.name);
    if (nameCheck) {
      results.toolFindings.push({
        issueType: 'Prompt Injection Context',
        name: tool?.name || 'tool',
        severity: nameCheck.severity,
        reasons: [`Suspicious tool name detected: "${nameCheck.name}" pattern in "${tool.name}"`],
        tags: ['prompt-injection', 'suspicious-tool-name'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'This tool name suggests potential prompt injection or security bypass intent.',
      });
    }

    const matches = scanText(toolToText(tool));
    if (matches) {
      results.toolFindings.push({
        issueType: 'Prompt Injection Context',
        name: tool?.name || 'tool',
        severity: 'high',
        reasons: [buildReason(`tool "${tool?.name || 'unknown'}"`, matches)],
        tags: ['prompt-injection', 'context-injection'],
        mcpCategory: OWASP_ID,
        safeUseNotes:
          'Review tool inputs for prompt injection vulnerabilities. Implement input validation and sanitization.',
      });
    }
  }

  for (const resource of mcpData.resources || []) {
    const matches = scanText(resourceToText(resource));
    if (matches) {
      results.resourceFindings.push({
        issueType: 'Prompt Injection Context',
        uri: resource?.uri || resource?.name || 'resource',
        severity: 'high',
        reasons: [
          buildReason(`resource "${resource?.name || resource?.uri || 'unknown'}"`, matches),
        ],
        tags: ['prompt-injection', 'context-injection'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  for (const prompt of mcpData.prompts || []) {
    const matches = scanText(promptToText(prompt));
    if (matches) {
      results.promptFindings.push({
        issueType: 'Prompt Injection Context',
        name: prompt?.name || 'prompt',
        severity: 'critical',
        reasons: [buildReason(`prompt "${prompt?.name || 'unknown'}"`, matches)],
        tags: ['prompt-injection', 'context-injection'],
        mcpCategory: OWASP_ID,
      });
    }
  }

  return results;
}

const adapter = createRuleAdapter(scanMCP06PromptInjection, RULE_ID, OWASP_ID, RECOMMENDATION);

export const analyzeTool = adapter.analyzeTool;
export const analyzePrompt = adapter.analyzePrompt;
export const analyzeResource = adapter.analyzeResource;

export function analyzePacket(packet) {
  const findings = [];
  const text = packetToText(packet);

  // Check for suspicious tool names in tools/call requests
  if (packet.body?.method === 'tools/call' && packet.body?.params?.name) {
    const nameCheck = checkToolName(packet.body.params.name);
    if (nameCheck) {
      findings.push(
        convertPacketFinding(
          {
            issueType: 'Prompt Injection Context',
            severity: nameCheck.severity,
            title: `Suspicious Tool Call: ${nameCheck.name}`,
            description: `Tool "${packet.body.params.name}" matches suspicious pattern: ${nameCheck.name}`,
            evidence: packet.body.params.name,
          },
          RULE_ID,
          OWASP_ID,
          RECOMMENDATION,
          packet
        )
      );
    }
  }

  const matches = scanText(text);
  if (matches) {
    findings.push(
      convertPacketFinding(
        {
          issueType: 'Prompt Injection Context',
          severity: 'high',
          title: 'Prompt Injection Pattern in Traffic',
          description: `Potential prompt injection in packet: ${matches.join(', ')}`,
          evidence: matches[0]?.substring(0, 50) || '',
        },
        RULE_ID,
        OWASP_ID,
        RECOMMENDATION,
        packet
      )
    );
  }

  return findings;
}

export const ruleMetadata = {
  id: RULE_ID,
  name: 'Prompt Injection Detection',
  owasp_id: OWASP_ID,
  severity: 'critical',
  description:
    'Detects prompt injection attempts via contextual payloads and suspicious tool names.',
  source: 'static',
  type: 'owasp-mcp',
};
